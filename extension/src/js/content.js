import * as idCatcher from './content/id-catcher';

// if master-mode is active create red border
function toggleMasterMode(active) {
  if (active === true) {
    document.body.style.border = '5px solid red';
  } else {
    document.body.style.border = 'none';
  }
}
// check if master-mode is active when onload event is fired
window.onload = () => {
  chrome.storage.local.get({ masterMode: false }, (items) => {
    toggleMasterMode(items.masterMode);
  });
};
// get master-mode changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if ('masterMode' in changes) {
    toggleMasterMode(changes.masterMode.newValue);
  }
});

// extension message listener
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'getresults') {
      const ids = idCatcher.getIds();
      const iframeCount = window.frames.length.toString();
      sendResponse({ iframes: iframeCount, ids });
      return true;
    }
  },
);

