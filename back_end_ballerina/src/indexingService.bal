import ballerina/http;
import ballerina/lang.'int as ints;
import ballerina/log;
import ballerina/mime;
import ballerina/io;

listener http:Listener boardToServer_Listener = new (9094);
http:Client clientEP = new ("http://localhost:9200");

@http:ServiceConfig
{
    basePath:"/board_to_server"
}

service indexing_Service on boardToServer_Listener 
{

    @http:ResourceConfig
    {
        methods: ["PUT"],
        path: "/replace/{index}/{doc}/{id}"
    }

    resource function overWriteDocument(
        http:Caller caller,
        http:Request request, 
        string index, 
        string doc, 
        string id
        ) 
    {

        http:Response response = new;
        var prID = ints:fromString(id);
        var data = request;

        if (data.hasHeader("content-type"))
        {
            string baseType = getBaseType(data.getContentType());
            if (mime:APPLICATION_JSON == baseType) 
            {
                var payload = data.getJsonPayload();
                if (payload is json) 
                {
                    if (prID is int)
                    {
                        response.setPayload(<@untainted>payload);
                        log:printInfo("Json data: " + payload.toJsonString());
                        var aux = clientEP->put(
                            <@untainted>("/"+index+"/"+doc+"/"+id),
                            <@untainted>payload
                            );
                        log:printInfo(aux.toString());
                    } 
                    else 
                    {
                        response.statusCode = http:STATUS_BAD_REQUEST;
                        response.setPayload("Error: id parameter should be a valid integer");
                    }
                    var respRet = caller->respond(<@untainted>response);
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

    @http:ResourceConfig
    {
        methods: ["POST"],
        path: "/add/{index}/{doc}"
    }

    resource function indexingDataToElastic(
        http:Caller caller, 
        http:Request request, 
        string index, 
        string doc
        )
    {
        var data = request;
        string baseType = getBaseType(data.getContentType());

        if (mime:APPLICATION_JSON == baseType) 
        {
            var payload = data.getJsonPayload();
            if (payload is json) 
            {
                var respRet = caller->respond(<@untainted>payload);
                log:printInfo("Json data: " + payload.toJsonString());
                var aux = clientEP->post(
                    <@untainted>("/"+index + "/"+doc), 
                    <@untainted >payload
                    );
                log:printInfo(aux.toString());
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
        io:println("Success");
    }
}



// function getBaseType(string contentType) returns string {
//     var result = mime:getMediaType(contentType);
//     if (result is mime:MediaType) {
//         return result.getBaseType();
//     } else {
//         panic result;
//     }
// }
