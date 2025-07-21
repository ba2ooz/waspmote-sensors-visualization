import ballerina/http;
import ballerina/log;
import ballerina/mime;
import ballerina/crypto;
import ballerina/jwt;
import ballerina/config;
import ballerina/io;

crypto:TrustStore trustStore = 
    {
        path: config:getAsString("b7a.home") +
            "/usr/lib/ballerina/distributions/jballerina-1.2.1/bre/security/ballerinaTruststore.p12",
        password: "ballerina"
    };

jwt:InboundJwtAuthProvider jwtAuthProvider = new 
    ({
        issuer: "wso2",
        audience: "ballerina",
        clockSkewInSeconds: 60,
        trustStoreConfig: 
        {
            certificateAlias: "ballerina",
            trustStore: trustStore
        }
    });

http:BearerAuthHandler jwtAuthHandler = new (jwtAuthProvider);


listener http:Listener frontEndClient_Listener = new (9092, config = 
{
    auth: 
    {
        authHandlers: [jwtAuthHandler]
    },

    secureSocket: 
    {
        keyStore: 
        {
            path: config:getAsString("b7a.home") +
                "/usr/lib/ballerina/distributions/jballerina-1.2.1/bre/security/ballerinaKeystore.p12",
            password: "ballerina"
        }
    }
});

http:Client elasticDB = new("http://localhost:9200/");

type searchParams record 
{
    string fromDate;
    string toDate;
    int size;
};

@http:ServiceConfig
{
    basePath: "/elastic",
    cors: 
    {
        allowOrigins: ["http://127.0.0.1:4200/*"],
        allowCredentials: false,
        allowHeaders: ["*"],
        exposeHeaders: ["*"],
        maxAge: 84900
    }
}

service frontEndClientListener_Service on frontEndClient_Listener
{
    @http:ResourceConfig 
    {
        methods: ["POST"],
        path: "/{index}",
        auth: 
        {
            enabled: true
        }
    }

    resource function retrieveWaspSensorsData(
        http:Caller httpCaller, 
        http:Request request, 
        string index
        )
    {
        http:Response response = new;
        var payloadJson = request.getJsonPayload();
        json queryJson = {};

        if(payloadJson is json)
        {    
            io:println("request: " + payloadJson.toJsonString());
            searchParams|error searchParamsData = searchParams.constructFrom(payloadJson);
            if(searchParamsData is searchParams)
            {
                if(searchParamsData.fromDate == "" && searchParamsData.toDate == "")
                {
                    queryJson = 
                    {
                        "size":10,
                        "query":{
                            "match_all":{}
                        },
                        "sort":[{
                            "date":{
                                "order":"desc"
                            }
                        }]
                    };
                } 
                else 
                {
                    if(searchParamsData.size == 0)
                    {
                        searchParamsData.size = 10;
                    }
                    
                    queryJson = 
                    {
                        "size":searchParamsData.size,
                        "query":{
                            "bool":{
                                "filter":{
                                    "range":{
                                        "date":{
                                            "gt":searchParamsData.fromDate,
                                            "lt":searchParamsData.toDate
                                        }
                                    }
                                }
                            }
                        },
                        "sort":[{
                            "date":{
                                "order":"asc"
                            }
                        }]
                    };
                }
                io:println("fromDate: " + searchParamsData.fromDate);
                io:println("json: " + queryJson.toJsonString());
                var ret = elasticDB->get(
                    <@untainted>("/"+index+"/_search?filter_path=hits.hits._source"),
                    <@untained>queryJson
                    );
                if(ret is http:Response)
                {
                    var retJson = ret.getJsonPayload();
                    if(retJson is json)
                    {
                        response.setPayload(<@untained>retJson);
                    }
                }
            }
            else 
            {
                response.statusCode = http:STATUS_BAD_REQUEST;
                response.setPayload("Error: Please send the JSON payload in the correct format");
            }
        }
        else 
        {
            // Send an error response in case of an error retriving the request payload
            response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
            response.setPayload("Error: An internal error occurred");
        }
        var respondRet = httpCaller->respond(response);
        if (respondRet is error) 
        {
            // Log the error for the service maintainers.
            log:printError("Error responding to the client", err = respondRet);
        }
    }

    @http:ResourceConfig 
    {
        methods: ["GET"],
        path: "/acc_sensor",
        auth: 
        {
            enabled: true
        }
    }

    resource function retrieveAccSensorData(
        http:Caller httpCaller, 
        http:Request request
        )
    {     
        var data = elasticDB->get(<@untainted> ("/acc_sensor/_source/1"));
        if (data is http:Response)
        {
            if (data.hasHeader("content-type"))
            {
                string baseType = getBaseType(data.getContentType());
                if (mime:APPLICATION_JSON == baseType) 
                {
                    var payload = data.getJsonPayload();
                    if (payload is json) 
                    {
                        var respRet = httpCaller->respond(<@untainted>payload);
                        log:printInfo("Json data: " + payload.toJsonString());
                        if(respRet is error)
                        {
                            log:printError("error responding to the client", err = respRet);
                        }
                    } 
                    else 
                    {
                        log:printError("Error in parsing json data", err = payload);
                    }
                }
            }
        }
    }
}

function getBaseType(string contentType) returns string 
{
    var result = mime:getMediaType(contentType);
    if (result is mime:MediaType)
    {
        return result.getBaseType();
    } 
    else
    {
        panic result;
    }
}



