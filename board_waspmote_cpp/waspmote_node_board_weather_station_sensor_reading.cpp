#include <WaspSensorAgr_v20.h>
#include <WaspWIFI.h>
#include <WaspFrame.h>

// TCP server settings
#define IP_ADDRESS "???.???.???.???"
#define REMOTE_PORT ?????
#define LOCAL_PORT ????

// WiFi AP settings
#define ESSID "SSID_PLACEHOLDER"
#define AUTHKEY "AUTHKEY_PLACEHOLDER"

// declaring variables in which to store the sensors measurements
float pluviometer1; // mm in current hour
float pluviometer2; // mm in previous hour
float pluviometer3; // mm in last 24 hours
float anemometer;
float soil_temp;
float pitch;
float temp;
float roll;
float lum;

int pendingPulses;
int vane;
int X_out;
int Y_out;
int Z_out;

uint8_t status;
uint8_t error;
uint8_t PITCH;
uint8_t ROLL;

void setup()
{
  SensorAgrv20.ON();      // Turn on the sensor board
  wifi_setup();           // configure wifi module
  SensorAgrv20.OFF();     // turn off the board to save energy

  frame.setID("node_WS"); // set waspmote node ID
}

void loop()
{
  // put board into sleep mode:
  // - no time-based sleep
  // - turn off socket0 
  // - keep RTC and pluviometer active during sleep
  // - wake up relies on RTC and pluviometer interruptions
  SensorAgrv20.sleepAgr(
    "00:00:00:00"
    ,RTC_ABSOLUTE
    ,RTC_ALM1_MODE6 
    ,SOCKET0_OFF 
    ,SENS_AGR_PLUVIOMETER);

  // check for pluviometer interruption
  if (intFlag & PLV_INT)
  {
    USB.println(F("+++ PLV interruption +++"));

    // turn on the sensor board to process pluviometer data
    SensorAgrv20.ON();            

    // process pending pluviometer pulses
    pendingPulses = intArray[PLV_POS];
    for (int i = 0; i < pendingPulses; i++)
    {
      // enter pulse information inside class structure
      SensorAgrv20.storePulse();  

      // decrease number of pulses
      intArray[PLV_POS]--;        
    }

    // turn off the sensor board to save power
    SensorAgrv20.OFF();    

    // clear flag       
    intFlag &= ~(PLV_INT);        
  }

  // check for RTC interruption
  if (intFlag & RTC_INT)
  {
    USB.println(F("+++ RTC interruption +++"));

    // turn on the sensor board to measure sensors and send data
    SensorAgrv20.ON();

    // measure sensors
    read_sensors();              
    send_frame();

    // turn off the sensor board to save power
    SensorAgrv20.OFF();  

    // clear flag
    intFlag &= ~(RTC_INT);        
  }
  
  // small delay to avoid potential looping issues
  delay(10);    
}

/*
 *  configures the wifi module
 */
void wifi_setup()
{
  // Switch ON the WiFi module
  status = WIFI.ON(SOCKET0)
  if (status == 1) { USB.println(F("WiFi switched ON")); }
  else { USB.println(F("WiFi did not initialize correctly")); }

  // Configure the transport protocol (UDP, TCP, FTP, HTTP...)
  WIFI.setConnectionOptions(CLIENT);
  // Configure the way the modules will resolve the IP address.
  WIFI.setDHCPoptions(DHCP_ON);
  // Sets the policy of joining the AP
  WIFI.setJoinMode(MANUAL);
  // Set Authentication key
  WIFI.setAuthKey(WPA2, AUTHKEY);
  // Save current configuration
  WIFI.storeData();

  WIFI.OFF();
}

/*
 *  reads the board sensors and Weather Station sensors,
 *  creates a new Waspmote Frame and populates it
 */
void read_sensors()
{

  USB.println(F("------------- Sensors reading ------------------"));

  // Turn on attached sensors
  SensorAgrv20.setSensorMode(SENS_ON, SENS_AGR_ANEMOMETER);
  SensorAgrv20.setSensorMode(SENS_ON, SENS_AGR_PT1000);
  SensorAgrv20.setSensorMode(SENS_ON, SENS_AGR_LDR);

  delay(10);

  // read attached sensors
  anemometer = SensorAgrv20.readValue(SENS_AGR_ANEMOMETER);
  soil_temp = SensorAgrv20.readValue(SENS_AGR_PT1000);
  vane = SensorAgrv20.readValue(SENS_AGR_VANE);
  lum = SensorAgrv20.readValue(SENS_AGR_LDR);

  pluviometer1 = SensorAgrv20.readPluviometerCurrent();
  pluviometer2 = SensorAgrv20.readPluviometerHour();
  pluviometer3 = SensorAgrv20.readPluviometerDay();

  // turn off attached sensors
  SensorAgrv20.setSensorMode(SENS_OFF, SENS_AGR_ANEMOMETER);
  SensorAgrv20.setSensorMode(SENS_OFF, SENS_AGR_PT1000);
  SensorAgrv20.setSensorMode(SENS_OFF, SENS_AGR_LDR);

  // Read on-board sensors
  RTC.ON();
  temp = RTC.getTemperature();
  RTC.OFF();

  ACC.ON();
  status = ACC.check();
  X_out = ACC.getX();
  Y_out = ACC.getY();
  Z_out = ACC.getZ();
  ACC.OFF();

  // calculate roll and pitch -- !!! should not be done on the board to not waste energy !!!
  roll = atan(Y_out / sqrt(pow(X_out, 2) + pow(Z_out, 2))) * 180 / PI;
  pitch = atan(-1 * X_out / sqrt(pow(Y_out, 2) + pow(Z_out, 2))) * 180 / PI;

  // get vane direction
  char* vane_direction = get_wind_direction_string(SensorAgrv20.vaneDirection);

  // Create and populate frame with sensors data
  frame.createFrame(ASCII);
  frame.addSensor(SENSOR_BAT, PWR.getBatteryLevel());
  frame.addSensor(SENSOR_WV, vane_direction);
  frame.addSensor(SENSOR_PLV1, pluviometer1);
  frame.addSensor(SENSOR_PLV2, pluviometer2);
  frame.addSensor(SENSOR_PLV3, pluviometer3);
  frame.addSensor(SENSOR_SOILT, soil_temp);
  frame.addSensor(SENSOR_ANE, anemometer);
  frame.addSensor(SENSOR_TCA, temp);
  frame.addSensor(SENSOR_LUM, lum);
  frame.addSensor(PITCH, pitch);
  frame.addSensor(ROLL, roll);
}

/*
 *  returns vane direction as a string
 */
char* get_wind_direction_string(uint8_t vaneDirectionNumeric)
{
  switch (vaneDirectionNumeric) {
    case SENS_AGR_VANE_N:   return "N";
    case SENS_AGR_VANE_NNE: return "NNE";
    case SENS_AGR_VANE_NE:  return "NE";
    case SENS_AGR_VANE_ENE: return "ENE";
    case SENS_AGR_VANE_E:   return "E";
    case SENS_AGR_VANE_ESE: return "ESE";
    case SENS_AGR_VANE_SE:  return "SE";
    case SENS_AGR_VANE_SSE: return "SSE";
    case SENS_AGR_VANE_S:   return "S";
    case SENS_AGR_VANE_SSW: return "SSW";
    case SENS_AGR_VANE_SW:  return "SW";
    case SENS_AGR_VANE_WSW: return "WSW";
    case SENS_AGR_VANE_W:   return "W";
    case SENS_AGR_VANE_WNW: return "WNW";
    case SENS_AGR_VANE_NW:  return "NW";
    case SENS_AGR_VANE_NNW: return "NNW";
    default:                return "";
  }
}

/*
 *  sends the frame over TCP
 */
void send_frame()
{
  // Switch WiFi ON
  status = WIFI.ON(SOCKET0);
  if (status == 1) { USB.println(F("WiFi switched ON")); } 
  else { USB.println(F("WiFi did not initialize correctly")); }

  //  Join AP
  status = WIFI.join(ESSID);
  if (status == 1) { USB.println(F("Joined AP")); }
  else { USB.println(F("NOT Connected to AP")); }

  // try open a TCP connection
  status = WIFI.setTCPclient(IP_ADDRESS, REMOTE_PORT, LOCAL_PORT);
  if (status == 1) {
    // connection is open now
    USB.println(F("TCP client set"));

    // send frame
    WIFI.send(frame.buffer, frame.length);

    // close the TCP connection.
    USB.println(F("Close TCP socket"));
    WIFI.close();
  }

  // Switch off wifi module
  WIFI.OFF();
}
