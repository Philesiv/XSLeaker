// iframes.js 
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.type == "iframes")
        console.log("Iframes Count: " + frames.length.toString());
        sendResponse({iframes: frames.length.toString()});
        return true;
    }
  );