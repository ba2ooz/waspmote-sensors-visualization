import ballerina/tcp;
import ballerina/log;
import ballerina/lang.runtime;

public function main() returns error? {
    string str = "Hello, World!";
    byte[] byteArr = str.toBytes();

    runtime:sleep(5);

    log:printInfo("start connection");
    tcp:Client boardClient = check new ("localhost", 61598);
    check boardClient->writeBytes(byteArr);
    check boardClient->close();
}
