import '../css/popup.css';
import '../css/bootstrap.min.css';
import './popup/bootstrap.bundle.min';

const backgroundPort = chrome.runtime.connect({ name: 'popup-connection' });

backgroundPort.onMessage.addListener((msg) => {
  console.log(`background message received: ${JSON.stringify(msg)}`);
  if (msg.action === 'getStateName') {
    document.getElementById('txtStateName').value = msg.value;
  }
});

function restoreSettings() {
  chrome.storage.local.get({
    masterMode: false,
    replicaMode: false,
    active: false,
  }, (items) => {
    document.getElementById('switchMasterMode').checked = items.masterMode;
    if (items.active) {
      document.getElementById('extensionControl').disabled = false;
      if (!items.masterMode) {
        document.getElementById('btnResults').disabled = true;
      }
      document.getElementById('btnDeactivate').disabled = false;
      document.getElementById('btnActivate').disabled = true;
      backgroundPort.postMessage({ action: 'getStateName' });
    }
  });
}

function toggleMasterMode() {
  const checkbox = document.getElementById('switchMasterMode');
  chrome.storage.local.set({
    masterMode: checkbox.checked,
  });
  if (checkbox.checked) {
    document.getElementById('btnResults').disabled = false;
  } else {
    document.getElementById('btnResults').disabled = true;
  }
}

function activateExtension() {
  document.getElementById('extensionControl').disabled = false;
  document.getElementById('btnDeactivate').disabled = false;
  document.getElementById('btnActivate').disabled = true;
  chrome.storage.local.set({
    active: true,
  });
  chrome.storage.local.get({ masterMode: false }, (items) => {
    if (!items.masterMode) {
      document.getElementById('btnResults').disabled = true;
    }
  });
  backgroundPort.postMessage({ action: 'activate' });

  // refresh page to get http responses
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.reload(tabs[0].id);
  });
}

function deactivateExtension() {
  // reset UI
  document.getElementById('extensionControl').disabled = true;
  document.getElementById('btnDeactivate').disabled = true;
  document.getElementById('btnActivate').disabled = false;
  document.getElementById('switchMasterMode').checked = false;
  document.getElementById('txtStateName').value = '';
  // reset values
  chrome.storage.local.set({
    active: false,
  });
  backgroundPort.postMessage({ action: 'deactivate' });
}

// set State name
// ToDo: Get Failure message if requirements not met
function setStateName() {
  const stateNameField = document.getElementById('txtStateName');
  console.log(stateNameField.value);
  if (stateNameField.value !== '') {
    backgroundPort.postMessage({ action: 'setStateName', value: stateNameField.value });
  } else {
    console.log('Empty state name will be ignored');
  }
}

function sendResults() {
  backgroundPort.postMessage({ action: 'sendResults' });
}

// check if masterModeStatus changes to replicaMode
chrome.storage.onChanged.addListener((changes) => {
  if ('replicaMode' in changes) {
    if (changes.replicaMode.newValue === true) {
      document.getElementById('switchMasterMode').checked = false;
      document.getElementById('btnResults').disabled = true;
    }
  }
});

document.addEventListener('DOMContentLoaded', restoreSettings);
document.getElementById('switchMasterMode').addEventListener('click', toggleMasterMode);
document.getElementById('btnActivate').addEventListener('click', activateExtension);
document.getElementById('btnDeactivate').addEventListener('click', deactivateExtension);
document.getElementById('btnSetStateName').addEventListener('click', setStateName);
document.getElementById('btnResults').addEventListener('click', sendResults);
