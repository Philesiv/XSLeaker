// collects the test results
import * as webSocket from './webSocket-Manager';
import * as requestManager from './request-Manager';
import * as cookieManager from './cookie-Manager';

function getResults() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getresults' }, (response) => {
      cookieManager.getCookiesForTab(tabs[0], (cookieProps) => {
        const message = {
          action: 'setResults',
          values: {
            iframes: response.iframes,
            httpStatusCode: requestManager.httpStatusCode,
            currentUrl: tabs[0].url,
            redirects: requestManager.redirectCount,
            headers: requestManager.headers,
            websockets: requestManager.webSocketCount,
            ids: response.ids,
            cookieProps,
          },
        };
        chrome.storage.local.get({ masterMode: false }, (items) => {
          console.log(items.masterMode);
          if (items.masterMode) {
            message.action = 'startTest';
          }
          console.log('Message: ', message);
          webSocket.sendWebsocketMessage(message);
        });
      });
    });
  });
}

export { getResults };
