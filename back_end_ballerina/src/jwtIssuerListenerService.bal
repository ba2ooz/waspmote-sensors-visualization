import ballerina/config;
import ballerina/crypto;
import ballerina/io;
import ballerina/jwt;
import ballerina/time;
import ballerina/http;


type credentials record
{
    string username;
    string password;
};


crypto:KeyStore keyStore = 
{
    path: config:getAsString("b7a.home") +
        "/usr/lib/ballerina/distributions/jballerina-1.2.1/bre/security/ballerinaKeystore.p12",
    password: "ballerina"
};

jwt:JwtKeyStoreConfig keyStoreConfig = 
{
    keyStore: keyStore,
    keyAlias: "ballerina",
    keyPassword: "ballerina"
};

jwt:JwtHeader header = {};
jwt:JwtPayload payload = {};

listener http:Listener jwtIssuer_Listener = new (9091);

@http:ServiceConfig 
{
    basePath: "/login"
}

service jwtIssuerListener_Service on jwtIssuer_Listener
{
    @http:ResourceConfig
    {
        methods: ["POST"],
        path: "/"
    }

    resource function generateIssue(http:Caller caller, http:Request request)
    {
        json resp = {};
        var requestPayload = request.getJsonPayload();
        if(requestPayload is json)
        {
            credentials|error checkCredentials = credentials.constructFrom(requestPayload);

            if(checkCredentials is credentials)
            {
                if(checkCredentials.username == "admin" && checkCredentials.password == "admin")
                {
                    header.alg = jwt:RS256;
                    header.typ = "JWT";

                    payload.sub = "admin"; 
                    payload.iss = "wso2";
                    payload.jti = "100078234ba23";
                    payload.aud = "ballerina";
                    payload.exp = time:currentTime().time/1000 + 30;

                    string|jwt:Error jwt = jwt:issueJwt(header, payload, keyStoreConfig);
                    if (jwt is string) 
                    {
                        resp = 
                        {
                            "id_token": jwt,
                            "expires_at": time:currentTime().time/1000 + 30
                        };
                        error? result = caller->respond(resp);
                        io:println("Issued JWT: ", resp);
                    } 
                    else 
                    {
                        io:println("An error occurred while issuing the JWT: ", jwt.detail()?.message);
                    }
                } 
                else 
                {
                    resp = {"error": "User with such credentials does not exist!"};
                    error? result = caller->respond(resp);
                }
            }
        }
    }
}