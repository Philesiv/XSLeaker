const WS_URL = "ws://localhost:3030";

let ws;

let popupPort;

let stateName = "";

let httpStatusCode;
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
        active: false
    });
    console.log('open');
});


function connectWebsocket(){
    // connect if not already connected
    if(ws === undefined || ws.readyState !== WebSocket.OPEN){
        chrome.storage.local.get({webSocketServer: "ws://localhost:3030"}, (item) => {
            ws = new WebSocket(item.webSocketServer);
            ws.onopen = () => { 
                console.log('WebSocket connected'); 
                chrome.browserAction.setIcon({path:{
                    "32": "img/favicon-32x32_red.png"
                }});
            };
            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message.action === "changeSite"){
                    chrome.tabs.query({currentWindow: true, active:true}, (tab) => {
                        chrome.tabs.update(tab.id, {url: message.url});
                      });
                }else if(message.action === "getStateName"){
                    console.log("Statename")
                    popupPort.postMessage({action: "getStateName", value: message.value});
                    stateName = message.value;
                }
            };
        });
    }else{
        console.log('WebSocket already connected!');
    }
}

function disconnectWebsocket(){
    if(ws !== undefined && ws.readyState === WebSocket.OPEN){
        ws.close();
        console.log('WebSocket disconnected');
        chrome.browserAction.setIcon({path:{
            "32": "img/favicon-32x32.png"
        }});
    }
}

function sendWebsocketMessage(message){
    if(ws !== undefined && ws.readyState === WebSocket.OPEN){
        ws.send(JSON.stringify(message));
    }else{
        console.error("Can't send WebSocket-Message. WebSocket is undefined or not connected");
    }
}

function requestListener(details){
    console.log(details.statusCode);
    httpStatusCode = details.statusCode;
}

function addRequestListener(){
    chrome.webRequest.onHeadersReceived.addListener(requestListener, {urls: ["<all_urls>"], types: ["main_frame"]}, ["responseHeaders"]);
}

function removeRequestListener(){
    chrome.webRequest.onHeadersReceived.removeListener(requestListener);
    httpStatusCode = null;
}


chrome.runtime.onConnect.addListener((port) => {
    if(port.name === "popup-connection"){
        popupPort = port;
        //connectToWebsocket();
        popupPort.onMessage.addListener((msg) => {
            console.log("Popup action: " + msg.action);
            if (msg.action === "activate") {
                connectWebsocket();
                addRequestListener();
            }else if(msg.action === "deactivate"){
                disconnectWebsocket();
                removeRequestListener();
            }else if(msg.action === "getStateName"){
                popupPort.postMessage({action: "getStateName", value: stateName});
            }else if(msg.action === "setStateName"){
                stateName = msg.value;
                sendWebsocketMessage(msg);
            }else if(msg.action === "sendResults"){
                getResults();
            }
        });


    }
});

// Master-Mode: get url Change of current tab 
// ToDo: send new url to server 
chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
    chrome.tabs.query({ currentWindow: true, active: true },(tabs) =>  { 
        if (tabs[0].id === tabId){
            chrome.storage.local.get({masterMode: false}, (items) => {
                if(items.masterMode && changeInfo.url){
                    console.log("[Master-Mode] New URL: " + changeInfo.url);
                    let message = {
                        'action': 'changeSite',
                        'url': changeInfo.url
                    };
                    sendWebsocketMessage(message);
                }
                if(changeInfo.url){
                    currentUrl = changeInfo.url;
                }
            });
        }
    });          
});

// send URL when Master-Mode is activated by user 
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if ("masterMode" in changes && changes.masterMode.newValue === true) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            let activeTab = tabs[0];
            let message = {
                'action': 'changeSite',
                'url': activeTab.url
            };
            sendWebsocketMessage(message);
        });
    }
  });


//iframes

function getResults () {
    //get iframe count from main window
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "getresults"}, function(response) {
        
        
        let message = { 
          'action': 'setResults',
          'values': {
                'iframes': response.iframes,
                'httpStatusCode': httpStatusCode,
                'currentUrl': currentUrl
          },
        };
        sendWebsocketMessage(message);
        //ws.send(JSON.stringify(message));
        //addRow("IFrames", response.iframes);
      });
    });
}


