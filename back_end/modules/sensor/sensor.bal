import back_end.utils;

import ballerina/log;

const string FRAME_DELIMITER = "#";
const string KEY_VALUE_DELIMITER = ":";
const string VALUE_DELIMITER = ";";

// keeps the expected sensor tags
public enum Sensor {
    BAT // battery 
    , WV // weathervane; wind direction
    , PLV1 // pluviometer current hour
    , PLV2 // pluviometer previous hour
    , PLV3 // pluviometer last day
    , SOILT // soil temperature
    , ANE // anemometer
    , TCA // ambient temperature
    , LUM // luminosity
    , ACC // accelerometer
    , GPS
}

type Acc record {
    int x;
    int y;
    int z;
};

type Gps record {
    float lt;
    float lg;
};

// map each sensor to its required type conversion function
public map<function (string) returns any|error> typeConverterMap = {
    BAT: toInt,
    WV: toInt,
    ACC: toAcc,
    PLV1: toFloat,
    PLV2: toFloat,
    PLV3: toFloat,
    SOILT: toFloat,
    ANE: toFloat,
    TCA: toFloat,
    LUM: toFloat,
    GPS: toGps
};

public function processFrame(string frame) returns json|error? {
    // split the frame to get the sensors' key-value pairs as strings
    var frame_pieces = utils:split(frame, FRAME_DELIMITER);
    if frame_pieces.length() is 0 {
        return error("Failed to process the Frame. It seems to be empty.");
    }

    // this will have each sensor tag mapped to its converted value of specific type
    map<anydata> converted_sensors = {};

    // frame payload starts at index 4, 
    // metadata info is contained on indexes 0-4 which is currently not needed  
    var index = 4;
    while index < frame_pieces.length() {
        var [sensor_tag, sensor_value] = check getFrameKeyValuePair(frame_pieces[index]);
        
        // get the pointer function for type conversion
        var ensure_required_type = typeConverterMap.get(sensor_tag);
        var cast_value = check ensure_required_type(sensor_value);
        
        // match cast_value {
        //     var v if v is float => { cast_value = <float>v; }
        //     var v if v is int => { cast_value = <int>v; }
        //     var v if v is Acc => { cast_value = <Acc>v; }
        //     var v if v is Gps => { cast_value = <Gps>v; }
        //     _ => { log:printInfo("Uknown type: " + (typeof cast_value).toBalString());}
        // }

        converted_sensors[sensor_tag] = <anydata>cast_value;
        index += 1;
    }

    return converted_sensors.toJson();
}

function getFrameKeyValuePair(string value) returns [string, string]|error {
    var kv_pairs = utils:split(value, KEY_VALUE_DELIMITER);
    var key = kv_pairs[0];
    var val = kv_pairs[1];

    return [key, val];
}

function toAcc(string value) returns Acc|error {
    var acc_axes = utils:split(value, VALUE_DELIMITER);
    var x_axis = check toInt(acc_axes[0]);
    var y_axis = check toInt(acc_axes[1]);
    var z_axis = check toInt(acc_axes[2]);

    return {x: x_axis, y: y_axis, z: z_axis};
}

function toGps(string value) returns Gps|error {
    var coords = utils:split(value, VALUE_DELIMITER);
    var lt_coord = check toFloat(coords[0]);
    var lg_coord = check toFloat(coords[1]);

    return {lt: lt_coord, lg: lg_coord};
}

function toInt(string value) returns int|error {
    return int:fromString(value);
}

function toFloat(string value) returns float|error {
    return float:fromString(value);
}
