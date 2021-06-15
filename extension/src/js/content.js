// if Master-Mode is active create a red border
function toggleMasterMode(active){
  if(active === true){
    document.body.style.border = "5px solid red";
  }else{
    document.body.style.border = "none";
  }
}

window.onload = () => {
  // check if mastermode is active
  chrome.storage.local.get({masterMode: false}, (items) => {
    toggleMasterMode(items.masterMode);
  });
};



// iframes.js 
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.type == "iframes")
        console.log("Iframes Count: " + frames.length.toString());
        sendResponse({iframes: frames.length.toString()});
        return true;
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if ("masterMode" in changes) {
    toggleMasterMode(changes.masterMode.newValue)
  }
});

