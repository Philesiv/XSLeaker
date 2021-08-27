const WebSocket = require('ws');
const resultManager = require('./utils/result-manager');
const ResultManager = require('./utils/result-manager');
// const DBManager = require('./utils/db-manager');

// adds [WebSocket] on log messages
function log(value) {
  console.log('[WebSocket]', value);
}

const socketServer = new WebSocket.Server({ port: 3030 });
log('Server started');

let connectionCount = 0;
let masterActive = false;

socketServer.on('connection', (socketClient) => {
  log(`Number of clients: ${socketServer.clients.size}`);
  // set default properties for each connection
  socketClient.stateName = `state ${++connectionCount}`;
  socketClient.id = connectionCount;
  socketClient.masterMode = false;
  socketClient.send(JSON.stringify({ action: 'getStateName', value: socketClient.stateName }));
  // hasMaster?
  if (masterActive) {
    const msg = {
      action: 'hasMaster',
      value: true,
    };
    socketClient.send(JSON.stringify(msg));
  }

  socketClient.on('message', (message) => {
    const jsonMessage = JSON.parse(message);
    log(`Message received: ${JSON.stringify(jsonMessage, null, 2)}`);

    if (jsonMessage.action === 'getResults') {
      socketClient.send(JSON.stringify(ResultManager.getResults()));
    } else if (jsonMessage.action === 'setResults') {
      ResultManager.setResults(jsonMessage.values, socketClient.stateName);
    } else if (jsonMessage.action === 'setStateName') {
      socketClient.stateName = jsonMessage.value;
      //log(`New state name: ${socketClient.stateName}`);
    } else if (jsonMessage.action === 'setMasterMode') {
      if (jsonMessage.value === true) {
        socketClient.masterMode = true;
        masterActive = true;
        const msg = {
          action: 'hasMaster',
          value: true,
        };
        socketServer.clients.forEach((client) => {
          if (client !== socketClient && client.readyState === WebSocket.OPEN) {
            client.masterMode = false;
            client.send(JSON.stringify(msg));
          }
        });
      } else {
        socketClient.masterMode = false;
        masterActive = false;
        const msg = {
          action: 'hasMaster',
          value: false,
        };
        socketServer.clients.forEach((client) => {
          if (client !== socketClient && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
          }
        });
      }
    } else if (socketClient.masterMode === true && jsonMessage.action === 'changeSite') {
      // broadcast event
      socketServer.clients.forEach((client) => {
        if (client !== socketClient && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } else if (socketClient.masterMode === true && jsonMessage.action === 'startTest') {
      // create new test entry and add values from master:
      resultManager.createNewTest(jsonMessage.values, socketClient.stateName, () => {
        // get results from other clients
        socketServer.clients.forEach((client) => {
          if (client !== socketClient && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });
      // broadcast event
    }
  });

  socketClient.on('close', (socketClient) => {
    log('Number of clients: ', socketServer.clients.size);
    if (socketClient.masterMode === true) {
      socketClient.masterMode = false;
      masterActive = false;
      const msg = {
        action: 'hasMaster',
        value: false,
      };
      socketServer.clients.forEach((client) => {
        if (client !== socketClient && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      });
    }
  });
});


function broadcastUrlMessage(testurl) {
  const msg = {
    action: 'changeSite',
    url: testurl,
  };
  socketServer.clients.forEach((client) => {
    client.send(JSON.stringify(msg));
  });
}

function broadcastStartMessage() {
  const msg = {
    action: 'startTest',
  };
  socketServer.clients.forEach((client) => {
    client.send(JSON.stringify(msg));
  });
}

module.exports = {
  broadcastUrlMessage,
  broadcastStartMessage,
};
