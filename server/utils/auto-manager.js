const fs = require('fs');
const readline = require('readline');
const WebSocket = require('ws');
const { broadcastUrlMessage, broadcastStartMessage } = require('../websocket');
const resultManager = require('./result-manager');

let stoped = false;
let running = false;
let currentUrl = '';
let counter = 0;

const wss = new WebSocket.Server({ port: 3031 });

wss.on('connection', (ws) => {
  const msg = {
    action: 'setStatus',
    running,
    url: currentUrl,
    counter,
  };
  ws.send(JSON.stringify(msg));
});

function sendUrl(url, count) {
  const msg = {
    action: 'updateUrl',
    url,
    counter: count,
  };
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(msg));
  });
}

function sendFinish() {
  const msg = {
    action: 'finished',
  };
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(msg));
  });
}

async function startTesting() {
  if (!running) {
    running = true;
    const fileStream = fs.createReadStream('./config/testurls.txt');
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    counter = 0;
    for await (const url of rl) {
      if (!stoped) {
        currentUrl = url.trim();
        if (currentUrl !== '') {
          counter += 1;
          sendUrl(currentUrl, counter);
          broadcastUrlMessage(currentUrl);
          resultManager.createNewEmptyTest(currentUrl);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          broadcastStartMessage();
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } else {
        break;
      }
    }
    running = false;
    stoped = false;
    sendFinish();
  } else {
    console.log('Test is already Running!');
  }
}

function stopTesting() {
  if (running === true) {
    stoped = true;
  }
}

module.exports = {
  startTesting,
  stopTesting,
};
