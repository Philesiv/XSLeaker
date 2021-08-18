import * as webSocket from './background/webSocket-Manager';
import * as requestManager from './background/request-Manager';
import { getResults } from './background/test-Manager';

// set default settings on install / update
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ webSocketServer: 'ws://localhost:3030' }, (item) => {
    chrome.storage.local.set({
      webSocketServer: item.webSocketServer,
    });
  });
});

// init Settings on every profile startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({
    masterMode: false,
    replicaMode: false,
    active: false,
  });
});

// Master-Mode: get url Change of current tab and send to other windows
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    if (tabs[0].id === tabId) {
      console.log('URL change event:', changeInfo);
      chrome.storage.local.get({ masterMode: false }, (items) => {
        if (items.masterMode && changeInfo.url) {
          console.log(changeInfo);
          let { url } = changeInfo;
          if (requestManager.redirectUrl !== '') {
            url = requestManager.redirectUrl;
            console.log(`Redirect happend, using url from redirect (${url})`);
          }
          console.log(`[Master-Mode] New URL: ${url}`);
          const message = {
            action: 'changeSite',
            url,
          };
          webSocket.sendWebsocketMessage(message);
        }
      });
    }
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if ('masterMode' in changes) {
    if (changes.masterMode.newValue === true) {
      let message = {
        action: 'setMasterMode',
        value: true,
      };
      webSocket.sendWebsocketMessage(message);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        message = {
          action: 'changeSite',
          url: activeTab.url,
        };
        webSocket.sendWebsocketMessage(message);
      });
    } else {
      const message = {
        action: 'setMasterMode',
        value: false,
      };
      webSocket.sendWebsocketMessage(message);
    }
  }
});

// shortcut listener
chrome.commands.onCommand.addListener((command) => {
  if (command === 'start-test') {
    // check if extension is activated
    chrome.storage.local.get({ active: false, masterMode: false }, (items) => {
      if (items.active || items.masterMode) {
        getResults();
      } else {
        console.log('Extension is not active or Master-Mode is not active');
      }
    });
  }
});
