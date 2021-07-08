let httpStatusCode;
let headers;
//let currentUrl;
let redirects = [];
let redirect;
let clearRedirects = false;

// ToDo -> den richtigen statuscode abchecken. Wäre bei redirects falsch!
// Idee: so lange request speichern bis ein normaler request kommt. Dann beim nächsten mal zurücksetzen
// redirect immer noch sehr komisch geloest. Bessere idee? 
function requestListener(details){
    redirect = false;
    headers = {};
    // clear redirects if last Request was not a redirect
    if(clearRedirects){
        redirects = [];
        clearRedirects = false;
    }
    // check headers here
    for (const header of details.responseHeaders){
        headers[header.name] = header.value;
        if(header.name === "Location"){
            redirects.push(details);
            console.log("Redirect!!!");
            redirect = true;
        }

    }
    if (redirect !== true){
        httpStatusCode = details.statusCode;
        //headers = details.responseHeaders;
        console.log("Redirects: ", redirects);
        clearRedirects = true;
    }
    console.log(details);
    //console.log(details.responseHeaders);
   
}

function addRequestListener(){
    chrome.webRequest.onHeadersReceived.addListener(requestListener, {urls: ["<all_urls>"], types: ["main_frame"]}, ["responseHeaders"]);
    chrome.webRequest.onHeadersReceived.addListener((details) => {
        console.log("WebSocket!!!!!");
        console.log(details);
    }, {urls: ["<all_urls>"], types: ["websocket"]}, ["responseHeaders"]);
}

function removeRequestListener(){
    chrome.webRequest.onHeadersReceived.removeListener(requestListener);
    httpStatusCode = null;
}

export{
    addRequestListener, 
    removeRequestListener,
    httpStatusCode,
    headers,
    redirects
};