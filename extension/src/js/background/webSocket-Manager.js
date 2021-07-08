let ws;
let stateName = "";

import { popupPort } from "./message-Manager";

// connects to WebSocket-server and adds listener
function connectWebsocket(){
    // connect if not already connected
    if(ws === undefined || ws.readyState !== WebSocket.OPEN){
        chrome.storage.local.get({webSocketServer: "ws://localhost:3030"}, (item) => {
            ws = new WebSocket(item.webSocketServer);
            ws.onopen = () => { 
                console.log('Connected'); 
                chrome.browserAction.setIcon({path:{
                    "32": "img/favicon-32x32_red.png"
                }});
            };
            ws.onclose = () => {
                console.log('Connection closed!');
                chrome.storage.local.set({
                    active: false
                });
                chrome.browserAction.setIcon({path:{
                    "32": "img/favicon-32x32.png"
                }});
            };
            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message.action === "changeSite"){
                    chrome.tabs.query({currentWindow: true, active:true}, (tab) => {
                        chrome.tabs.update(tab.id, {url: message.url});
                      });
                }else if (message.action === "startTest"){
                    getResults();
                }else if(message.action === "getStateName"){
                    console.log("Statename");
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

function getStateName(){
    return stateName;
}
function setStateName(value){
    stateName = value;
}

export {connectWebsocket, disconnectWebsocket, sendWebsocketMessage, getStateName, setStateName};