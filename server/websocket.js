const WebSocket = require('ws');
const ResultManager = require('./utils/result-manager');


// adds [WebSocket] on log messages
function log(value){
    console.log("[WebSocket]", value);
}

const socketServer = new WebSocket.Server({port: 3030});
log("Server started");


let connectionCount = 0;



socketServer.on('connection', (socketClient) => {
    log('connected!');
    log('Number of clients: ' + socketServer.clients.size);
    socketClient.stateName = 'state '  + (++connectionCount);
    socketClient.id = connectionCount;
    log('Set state name to: ' + socketClient.stateName );
    socketClient.send(JSON.stringify({action: "getStateName", value: socketClient.stateName }))
    socketClient.on('message', (message) => {
        jsonMessage = JSON.parse(message);
        log('Message received: ' + JSON.stringify(jsonMessage, null, 2));
        
        if (jsonMessage.action === "getResults" ){
            socketClient.send(JSON.stringify(ResultManager.getResults()));
        }
        else if (jsonMessage.action === "setResults") {
            ResultManager.setResults(jsonMessage.values, socketClient.stateName);
        }
        else if (jsonMessage.action === "changeSite" || jsonMessage.action === 'startTest') {
            //broadcast changeSite event
            socketServer.clients.forEach((client) => {
                if (client !== socketClient && client.readyState === WebSocket.OPEN){
                    client.send(message);
                }
            });
        }
        else if (jsonMessage.action === "setStateName"){
            socketClient.stateName = jsonMessage.value;
            log("New state name: " + socketClient.stateName);
            
        }
    });



    socketClient.on('close', (socketClient) => {
        log('Connection closed');
        log('Number of clients: ', socketServer.clients.size);

    });
});