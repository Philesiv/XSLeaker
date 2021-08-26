const fs = require('fs');
const readline = require('readline');
const { broadcastUrlMessage, broadcastStartMessage } = require('../websocket');
const resultManager = require('./result-manager');
let stoped = false;
let running = false;

async function startTesting() {
  console.log('startTesting()');
  if (!running){
  running = true;
  const fileStream = fs.createReadStream('./config/testurls.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  for await (const url of rl) {
    if (!stoped) {
      console.log('Testing URL:', url);
      const currentUrl = url.trim();
      broadcastUrlMessage(currentUrl);
      resultManager.createNewEmptyTest(currentUrl);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      broadcastStartMessage();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      break;
    }
  }
  running = false;
  stoped = false;
  }else {
    console.log("Already Running!!!");
  }
}

function stopTesting() {
  if (running === true) {
    stoped = true
  }
}

module.exports = {
  startTesting,
  stopTesting,
};
