import back_end.sensor;

import ballerina/lang.'string;
import ballerina/log;
import ballerina/tcp;

listener tcp:Listener waspmote_tcp_listener = new (61598);

service on waspmote_tcp_listener {
    remote function onConnect(tcp:Caller caller) returns tcp:ConnectionService {
        log:printInfo("Client connected: " + caller.id.toString());

        return new WaspmoteListener();
    }
}

service class WaspmoteListener {
    *tcp:ConnectionService;

    // Triggered when data is available to be read from the client
    remote function onBytes(tcp:Caller caller, readonly & byte[] data) returns tcp:Error? {
        // get data as string form the received byte array
        var frame_data = string:fromBytes(data);
        if (frame_data is error) {
            log:printError("string:fromBytes failed: ", frame_data);
            return <tcp:Error>frame_data;
        }

        // log:printInfo("Original frame: " + data.toString());
        // log:printInfo("Converted frame: " + frame_data);

        checkpanic sensor:processFrame(frame_data);
    }

    // Triggered if an error occurs in the connection
    remote function onError(tcp:Error err) {
        log:printError("Error in TCP connection with client: ", err);
    }

    remote function onClose() {
        log:printInfo("Client disconnected.");
    }
}
