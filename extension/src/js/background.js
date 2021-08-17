
import * as webSocket from './background/webSocket-Manager';
import * as requestManager from './background/request-Manager';


let currentUrl;


// set default settings on install / update
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get({webSocketServer: "ws://localhost:3030"}, (item) => {
        chrome.storage.local.set({
            webSocketServer: item.webSocketServer
        });
    });
});

// init Settings on every profile startup
chrome.runtime.onStartup.addListener(function() {
    chrome.storage.local.set({
        masterMode: false,
        replicaMode: false,
        active: false
    });
    console.log('open');
});


// Master-Mode: get url Change of current tab and send to other windows
chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
    chrome.tabs.query({ currentWindow: true, active: true },(tabs) =>  { 
        
        if (tabs[0].id === tabId){
            console.log('URL change event:',changeInfo);
            chrome.storage.local.get({masterMode: false}, (items) => {
                if(items.masterMode && changeInfo.url){
                    console.log(changeInfo);
                    console.log("[Master-Mode] New URL: " + changeInfo.url);
                    let message = {
                        'action': 'changeSite',
                        'url': changeInfo.url
                    };
                    webSocket.sendWebsocketMessage(message);
                }
                if(changeInfo.url){
                    currentUrl = changeInfo.url;
                }
            });
        }
    });          
});


chrome.storage.onChanged.addListener(function(changes, namespace) {
    if ("masterMode" in changes) {
        if(changes.masterMode.newValue === true){
            let message = {
                'action': 'setMasterMode',
                'value': true
            };
            webSocket.sendWebsocketMessage(message);
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                let activeTab = tabs[0];
                message = {
                    'action': 'changeSite',
                    'url': activeTab.url
                };
                webSocket.sendWebsocketMessage(message);
            });
        }else{
            let message = {
                'action': 'setMasterMode',
                'value': false
            };
            webSocket.sendWebsocketMessage(message);
        }
    }
  });



function getResults () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "getresults"}, function(response) {
        let message = { 
          'action': 'setResults',
          'values': {
                'iframes': response.iframes,
                'httpStatusCode': requestManager.httpStatusCode,
                'currentUrl': tabs[0].url,
                'redirects': requestManager.redirects.length,
                'headers': requestManager.headers,
                'websockets': requestManager.webSocketCount,
                'ids': response.ids
          },
        };
        chrome.storage.local.get({masterMode: false}, (items) => {
            console.log(items.masterMode);
            if(items.masterMode){
                message.action = 'startTest'
            }
            console.log("Message: ", message);
            webSocket.sendWebsocketMessage(message);
        });


      });
    });
}

//shortcut listener
chrome.commands.onCommand.addListener(function (command) {
    if (command === "start-test") {
        console.log("Test Shortcut received!");
        // check if extension is activated
        chrome.storage.local.get({active: false}, (items) => {
            if(items.active){
                getResults();
            }else{
                console.log("Extension is not active...");
            }
        });
    }
  });


  export {getResults};