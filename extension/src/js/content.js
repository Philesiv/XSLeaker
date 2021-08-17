import * as idCatcher from './content/id-catcher';

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



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action == "getresults")
        console.log("Iframes Count: " + frames.length.toString());
        const ids = idCatcher.getIds();
        sendResponse({iframes: frames.length.toString(), ids: ids});
        return true;
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if ("masterMode" in changes) {
    toggleMasterMode(changes.masterMode.newValue);
  }
});

