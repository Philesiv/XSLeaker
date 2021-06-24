import "../css/popup.css";
import "../css/bootstrap.min.css";
import "./popup/bootstrap.bundle.min.js";
//import hello from "./popup/example";


let startTest = document.getElementById('startTest');
let testResults = document.getElementById('testResults');
let windowID = document.getElementById('windowID');
let createWindowBtn = document.getElementById('createWindow');
let sendMessage = document.getElementById('sendMessage');
let changeSiteBtn = document.getElementById('changeSite');

var compareWindowId;

/* refactor this to background
const ws = new WebSocket('ws://localhost:3030');
ws.onopen = () => { 
  console.log('Now connected'); 
};

ws.onmessage = (event) => {
  console.log('message received:');
  const message = JSON.parse(event.data);

  if (message.action === "getResults") {
    Object.keys(message.results).forEach(function(key,index) {
      // später values als array übergeben und tabelle beliebig groß machen
      addRow(key, message.results[key][0], message.results[key][1]);
    });
  }
  if (message.action === "changeSite") {
    chrome.tabs.query({currentWindow: true, active:true}, (tab) => {
      chrome.tabs.update(tab.id, {url: message.url});
    });
  }
  messages.forEach( message => {
    console.log(message);
  });
};
*/
/*
sendMessage.onclick = function(event) {
  let message = {
    "action": "getResults"
  }
  ws.send(JSON.stringify(message));
}
*/



/*
function getIframes () {
  //get iframe count from main window
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: "iframes"}, function(response) {
      let message = {
        'action': 'setResult',
        'name': 'iframe',
        'value': response.iframes
      };
      //ws.send(JSON.stringify(message));
      addRow("IFrames", response.iframes);
    });
  });
  /* only needed in browser only extension
  //get iframe count from second window
  chrome.tabs.query({active: true, windowId: compareWindowId}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {type: "iframes"}, function(response) {
      addRow("IFrames", response.iframes);
    });
  });
  */
 /*
  console.log(iframeCount);
  return iframeCount;
}

startTest.onclick = function(element) {
  getIframes();
};


changeSiteBtn.onclick = (element) => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    let url = tabs[0].url;
    let message = {
      'action': 'changeSite',
      'url': url
    };
    console.log(message);
    //ws.send(JSON.stringify(message));
  });
};

createWindowBtn.onclick = function(element) {
  chrome.windows.create({url: 'https://crossorigin.xsinator.cf/testcases/tests/iframe.php?1'},(window) =>{
    compareWindowId = window.id;
  });
};


console.log(typeof(testResults));

function addRow(name, value1, value2) {
  let row = testResults.insertRow(-1);
  let cell1 = row.insertCell(0);
  let text1 = document.createTextNode(name);
  cell1.appendChild(text1);
  let cell2 = row.insertCell(1);
  let text2 = document.createTextNode(value1);
  cell2.appendChild(text2);
  let cell3 = row.insertCell(2);
  let text3 = document.createTextNode(value2);
  cell3.appendChild(text3);

}

chrome.windows.getCurrent(window => {
  windowID.innerText = window.id;
});



windowID.innerText = "windowID";
*/
let backgroundPort = chrome.runtime.connect({name: "popup-connection"});

backgroundPort.onMessage.addListener((msg) => {
  console.log("background message received: "+ JSON.stringify(msg));
  if(msg.action === "getStateName"){
    document.getElementById('txtStateName').value = msg.value;
  }
  
});


function restore_settings() {
  chrome.storage.local.get({
    masterMode: false,
    active: false,

  }, (items) => {
    document.getElementById('switchMasterMode').checked = items.masterMode;
    if (items.active){
      document.getElementById('extensionControl').disabled = false;
      document.getElementById('btnDeactivate').disabled = false;
      document.getElementById('btnActivate').disabled = true;
      backgroundPort.postMessage({action: "getStateName"});
    }

});
}

function toggleMasterMode() {
  let checkbox = document.getElementById('switchMasterMode');
  chrome.storage.local.set({
    masterMode: checkbox.checked
  });
}

function activateExtension(){
  document.getElementById('extensionControl').disabled = false;
  document.getElementById('btnDeactivate').disabled = false;
  document.getElementById('btnActivate').disabled = true;
  chrome.storage.local.set({
    active: true 
  });
  backgroundPort.postMessage({action: "activate"});

  // refresh page to get http responses
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    chrome.tabs.reload(tabs[0].id);
  });
}

function deactivateExtension(){
  // reset UI
  document.getElementById('extensionControl').disabled = true;
  document.getElementById('btnDeactivate').disabled = true;
  document.getElementById('btnActivate').disabled = false;
  document.getElementById('switchMasterMode').checked = false;
  document.getElementById('txtStateName').value = "";
  // reset values
  toggleMasterMode();
  chrome.storage.local.set({
    active: false 
  });
  backgroundPort.postMessage({action: "deactivate"});
}

// set State name
// ToDo: Get Failure message if requirements not met
function setStateName(){
  let stateNameField = document.getElementById('txtStateName');
  console.log(stateNameField.value);
  if(stateNameField.value !== ""){
    backgroundPort.postMessage({action: "setStateName", value: stateNameField.value});
  }else{
    console.log("Empty state name will be ignored");

  }
}

function sendResults(){
  backgroundPort.postMessage({action: "sendResults"});
}

document.addEventListener('DOMContentLoaded', restore_settings);
document.getElementById('switchMasterMode').addEventListener('click', toggleMasterMode);
document.getElementById('btnActivate').addEventListener('click', activateExtension);
document.getElementById('btnDeactivate').addEventListener('click', deactivateExtension);
document.getElementById('btnSetStateName').addEventListener('click', setStateName);
document.getElementById('btnResults').addEventListener('click', sendResults);
