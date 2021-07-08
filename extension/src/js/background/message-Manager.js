let popupPort;
import * as webSocket from './webSocket-Manager';
import {getResults} from '../background';
import {addRequestListener, removeRequestListener} from './request-Manager';

chrome.runtime.onConnect.addListener((port) => {
    if(port.name === "popup-connection"){
        popupPort = port;
        //connectToWebsocket();
        popupPort.onMessage.addListener((msg) => {
            console.log("Popup action: " + msg.action);
            if (msg.action === "activate") {
                webSocket.connectWebsocket();
                addRequestListener();
            }else if(msg.action === "deactivate"){
                webSocket.disconnectWebsocket();
                removeRequestListener();
            }else if(msg.action === "getStateName"){
                popupPort.postMessage({action: "getStateName", value: webSocket.getStateName()});
            }else if(msg.action === "setStateName"){
                webSocket.setStateName(msg.value);
                webSocket.sendWebsocketMessage(msg);
            }else if(msg.action === "sendResults"){
                getResults();
            }
        });


    }
});

export{popupPort};