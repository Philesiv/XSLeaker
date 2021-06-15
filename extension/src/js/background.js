const WS_URL = "ws://localhost:3030";

let ws;

let popupPort;

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

chrome.runtime.onConnect.addListener((port) => {
    if(port.name === "popup-connection"){
        popupPort = port;
        //connectToWebsocket();
        popupPort.onMessage.addListener((msg) => {
            console.log("Popup action: " + msg.action);
            if (msg.action === "connect") {
                connectWebsocket();
            }else if(msg.action === "disconnect"){
                disconnectWebsocket();
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
                    console.log("New URL: " + changeInfo.url);
                }
            });
        }
    });          
});



//popupPort.postMessage("hello there");