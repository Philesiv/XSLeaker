const WebSocket = require('ws');

const socketServer = new WebSocket.Server({port: 3030});

const messages = ['Start Chatting!'];
/* TODO: DELETE THIS! 
socketServer.on('connection', (socketClient) => {
    console.log('connected!');
    console.log('Number of clients: ', socketServer.clients.size);
    socketClient.send(JSON.stringify(messages));
    console.log(socketClient);
    socketClient.on('message', (message) => {
        messages.push(message);
        socketServer.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify([message]));
            }
        });
    });

    socketClient.on('close', (socketClient) => {
        console.log('closed');
        console.log('Number of clients: ', socketServer.clients.size);

    });
});
*/

dummyResult = {
    'action': 'getResults',
    'results': [
    {
        'name': 'iframe',
        'values': [1,25]
    }
]};

results = {
    'action': 'getResults',
    'results': {
        'iframe': []
    }
};


socketServer.on('connection', (socketClient) => {
    console.log('connected!');
    console.log('Number of clients: ', socketServer.clients.size);
    socketClient.on('message', (message) => {
        console.log(JSON.parse(message));
        jsonMessage = JSON.parse(message);
        if (jsonMessage.action === "getResults" ){
            socketClient.send(JSON.stringify(results));
        }
        if (jsonMessage.action === "setResult") {
            // check if exists
            if (results.results.hasOwnProperty(jsonMessage.name) && Array.isArray(results.results[jsonMessage.name])){
                console.log("Found array :)");
                results.results[jsonMessage.name].push(jsonMessage.value);
            }else {
                results.results[jsonMessage.name] = [jsonMessage.value];
            }

        }

        if (jsonMessage.action === "changeSite") {
            //broadcast changeSite event
            socketServer.clients.forEach((client) => {
                if (client !== socketClient && client.readyState === WebSocket.OPEN){
                    client.send(message);
                }
            });


        }

    });



    socketClient.on('close', (socketClient) => {
        console.log('closed');
        console.log('Number of clients: ', socketServer.clients.size);

    });
});