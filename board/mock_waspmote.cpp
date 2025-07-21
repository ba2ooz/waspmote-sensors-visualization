#include <iostream>
#include <fstream>
#include <string>
#include <cstring>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>

#define SERVER_IP "?.?.?.?" // Server IP
#define SERVER_PORT ?????     // Server port

class TCP_ERROR
{
private:
    std::string message;

public:
    const static int ERR_CODE = -1;

    TCP_ERROR(const std::string &msg)
    {
        message = msg;
    }

    std::string reason()
    {
        return message;
    }
};

class TCP
{
private:
    const char *server;
    uint16_t port;
    int tcp_socket;
    int status;

public:
    TCP(const char *server_ip, uint16_t server_port)
    {
        server = server_ip;
        port = server_port;
    }

    void setConnection()
    {
        // Define the server address
        sockaddr_in serverAddress;
        serverAddress.sin_family = AF_INET;
        serverAddress.sin_port = htons(port);

        status = inet_pton(AF_INET, server, &serverAddress.sin_addr);
        if (status <= 0)
            throw new TCP_ERROR("connection failed - invalid address.");

        // create a socket
        tcp_socket = socket(AF_INET, SOCK_STREAM, 0);
        if (tcp_socket == TCP_ERROR::ERR_CODE)
            throw new TCP_ERROR("create socket failed.");

        // connect to the server
        status = connect(tcp_socket, (struct sockaddr *)&serverAddress, sizeof(serverAddress));
        if (status == TCP_ERROR::ERR_CODE)
            throw new TCP_ERROR("connection failed.");
    }

    void sendFrame(const std::string &message)
    // void sendFrame(const char *message, const uint16_t length)
    {
        // create the byte frame
        size_t msg_size = message.size();
        char *msg_bytes_arr = new char[msg_size];
        std::memcpy(msg_bytes_arr, message.c_str(), msg_size);

        // send frame
        int status = send(tcp_socket, msg_bytes_arr, msg_size, 0);
        // int status = send(tcp_socket, message, length, 0);
        if (status == TCP_ERROR::ERR_CODE)
            throw new TCP_ERROR("error sending data.");

        // cleanup
        delete[] msg_bytes_arr;
    }

    void leave()
    {
        close(tcp_socket);
    }
};

#define MAX_FRAME 150

class Frame
{
    // ------------------ Frame Structure ------------------
    //                     HEADER                  |           PAYLOAD
    // <=>#FrameType NumFields # NodeId # Sequence # SENSOR1 # SENSOR2 # SENSORN #
    //"<=>#387227154#node_01#0#STR:this_is_a_string#BAT:100#IN_TEMP:29.0#"

    // -------------------- SENSORS ------------------------
    //      tag        ASCII      type    precision
    // SENSOR_BAT       BAT     uint8_t     0
    // SENSOR_WV        WV      uint8_t     N/A
    // SENSOR_PLV1      PLV1    float       2
    // SENSOR_PLV1      PLV1    float       2
    // SENSOR_PLV1      PLV1    float       2
    // SENSOR_SOILT     SOILT   float       2
    // SENSOR_ANE       ANE     float       2
    // SENSOR_TCA       TCA     float       2
    // SENSOR_LUM       LUM     float       3
    // SENSOR_ACC       ACC     int         0         #ACC:996;-250;-100#
    //                                                      x,   y,   z
    // SENSOR_GPS       GPS     float       6         #GPS:41.680616;-0.886233#
    // BAT:100#WV:NE#PLV1:20.31#PLV2:69.53#PLV3:69.53#SOILT:19.01#ANE:1.23#TCA:23.43#LUM:41.025#ACC:6;-2:-1#
private:
    const std::string DELIMITER = "#";
    const std::string FRAME_DELIMITER = "<=>#";
    const std::string SERIAL_ID = "wasp_sim#";
    std::string frame_header;
    std::string frame_payload;

    int sequence = 0;

public:
    uint8_t buffer[MAX_FRAME + 1];
    uint16_t length;

    Frame(const std::string &id)
    {
        frame_header = FRAME_DELIMITER + SERIAL_ID + id + DELIMITER + std::to_string(sequence) + DELIMITER;
        frame_payload = "";
        sequence = (__INT_MAX__ == sequence + 1) ? 0 : sequence + 1;
    }

    void addSensor(const std::string &sensorTag, const std::string &sensorValue)
    {
        frame_payload += sensorTag + ":" + sensorValue + DELIMITER;
    }

    std::string getFrame()
    {
        return frame_header + frame_payload;
    }
};

int main()
{
    Frame frame("node_1");
    frame.addSensor("BAT", "100");
    frame.addSensor("ACC", "1;-2;4");
    frame.addSensor("GPS", "41.004934;19.560023");

    // std::string frame = "<=>#wasp_sim#node_01#11#BAT:100#WV:NE#PLV1:20.31#PLV2:69.53#PLV3:69.53#SOILT:19.01#ANE:1.23#TCA:23.43#LUM:41.025#ACC:6;-2:-1#";
    try
    {
        //while(1) {
            // initiate tcp connection
            // iterate tgrough boards run schedule
            // measure sensors
            // send
            // stop tcp
        //}

        TCP tcp(SERVER_IP, SERVER_PORT);
        tcp.setConnection();
        // tcp.sendFrame(tempBuffer, frame.length);
        tcp.sendFrame(frame.getFrame());
        tcp.leave();
    }
    catch (TCP_ERROR err)
    {
        std::cout << err.reason() << std::endl;
    }

    return 0;
}