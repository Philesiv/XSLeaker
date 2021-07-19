let httpStatusCode;
let headers;
//let currentUrl;
let redirects = [];
let redirect;
let clearRedirects = false;
let completedRequest = false;
let webSocketCount = 0;

// delete me!!
function requestListener(details){
    console.log('RequestListener');
    console.log(details);
   
}

function completedListener(details){
    headers = {};
    console.log("onCompleted data:", details);
    httpStatusCode = details.statusCode;
    // add headers as keys for easy access
    for (const header of details.responseHeaders){
        headers[header.name.toLowerCase()] = header.value;
    }
    completedRequest = true;
    webSocketCount = 0;
    console.log(webSocketCount);
}

function redirectListener(details){
    console.log("Redirecte happend!");
    console.log("Redirect data:", details);
    if(completedRequest){
        redirects = [];
        completedRequest = false;
    }
    redirects.push(details);
}

// counts the established WebSocket connections for the site. Does not recognize disconnects!  
function webSocketListener(details){
    console.log("WebSocket connection!");
    console.log("WebSocket data:", details);
    webSocketCount++;
    console.log("WebSocket count:", webSocketCount);
}

function addRequestListener(){
    //chrome.webRequest.onHeadersReceived.addListener(requestListener, {urls: ["<all_urls>"], types: ["main_frame"]}, ["responseHeaders"]);
    chrome.webRequest.onHeadersReceived.addListener(webSocketListener, {urls: ["<all_urls>"], types: ["websocket"]}, ["responseHeaders"]);
    chrome.webRequest.onBeforeRedirect.addListener(redirectListener, {urls: ["<all_urls>"], types: ["main_frame"]}, ["responseHeaders"]);
    chrome.webRequest.onCompleted.addListener(completedListener, {urls: ["*://*/*"], types: ["main_frame"]}, ["responseHeaders"]);
}

function removeRequestListener(){
    chrome.webRequest.onHeadersReceived.removeListener(webSocketListener);
    chrome.webRequest.onBeforeRedirect.removeListener(redirectListener);
    chrome.webRequest.onCompleted.removeListener(completedListener);
    httpStatusCode = null;
}

export{
    addRequestListener, 
    removeRequestListener,
    httpStatusCode,
    headers,
    redirects,
    webSocketCount
};