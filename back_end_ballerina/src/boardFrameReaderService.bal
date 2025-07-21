import ballerina/http;
import ballerina/io;
import ballerina/lang.'float;
import ballerina/lang.'int;
import ballerina/log;
import ballerina/tcp;
import ballerina/time;

http:Client|http:ClientError waspmoteNodeIndexing_Service = new ("http://localhost:9094/board_to_server");
listener tcp:Listener boardRemote = new (61598);

service /boardFrameReader_Service on boardRemote
{
    remote function onConnect(tcp:Client caller)
    {
        log:printInfo("Client connected: " + caller.id.toString());
    }

    remote function onReadReady(tcp:Client caller)
    {
        http:Response meteoResponse;

        // reading the waspmote frame
        var result = caller->readBytes();
        if (result is [byte[], int])
        {
            var [content, length] = result;
            if (length > 0)
            {
                var byteChannel = io:createReadableChannel(content);
                if (byteChannel is io:ReadableByteChannel)
                {
                    io:ReadableCharacterChannel characterChannel =
                    new io:ReadableCharacterChannel(byteChannel, "UTF-8");
                    var str = characterChannel.read(150);
                    if (str is string)
                    {
                        // extracting data from the waspmote frame
                        string[] frameArray = stringutils:split(str, "#");
                        var plv1 = 'float:fromString(frameArray[4].substring(5));
                        var plv2 = 'float:fromString(frameArray[5].substring(5));
                        var plv3 = 'float:fromString(frameArray[6].substring(5));
                        var ane = 'float:fromString(frameArray[7].substring(4));
                        var vane = frameArray[8].substring(3);
                        var temp = 'float:fromString(frameArray[9].substring(4));
                        var soil_temp = 'float:fromString(frameArray[10].substring(6));
                        var lum = 'float:fromString(frameArray[11].substring(4));
                        var roll = 'float:fromString(frameArray[12].substring(3));
                        var pitch = 'float:fromString(frameArray[13].substring(3));
                        var bat = 'int:fromString(frameArray[14].substring(4));

                        time:Time timeN = time:currentTime();
                        string standardTimeString = time:toString(timeN);
                        string date = standardTimeString.substring(0, 19);

                        if (plv1 is float &&
                            plv2 is float &&
                            plv3 is float &&
                            ane is float &&
                            temp is float &&
                            soil_temp is float &&
                            lum is float &&
                            bat is int
                            )
                        {
                            var indexData = <json>
                            {
                                date: date,
                                pulviometer1: plv1,
                                pulviometer2: plv2,
                                pulviometer3: plv3,
                                anemometer: ane,
                                vane: vane,
                                temperature: temp,
                                soil_tempterature: soil_temp,
                                battery: bat
                            };

                            // indexing sensors data
                            meteoResponse = checkpanic waspmoteNodeIndexing_Service->post("/add/meteo_wasp_sensors/_doc", indexData);
                            log:printInfo(meteoResponse.getJsonPayload().toString());

                            if (roll is float && pitch is float)
                            {
                                indexData = <json>
                                {
                                    roll: roll,
                                    pitch: pitch
                                };
                            }

                            // indexing accelerometer data
                            meteoResponse = checkpanic waspmoteNodeIndexing_Service->put("/replace/acc_sensor/acc_data/1", indexData);
                            log:printInfo(meteoResponse.getJsonPayload().toString());
                        }
                    }
                    else
                    {
                        log:printError("Error while writing content to the caller", str);
                    }
                }
            }
            else
            {
                log:printInfo("Client left: " + caller.id.toString());
            }
        }
        else
        {
            io:println(result);
        }
    }

    remote function onError(tcp:Error err)
    {
        log:printError("An error occurred", 'error = err);
    }
}
