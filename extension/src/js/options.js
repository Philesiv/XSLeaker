import "../css/options.css";

function save_options() {
    let wsServer = document.getElementById('wsserver').value;
    chrome.storage.local.set({
        webSocketServer: wsServer
    }, () => {
        var status = document.getElementById('status');
        status.textContent = 'Option saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 750);
    });
}

function restore_options(){
    chrome.storage.local.get({
        webSocketServer: 'ws://localhost:3030'
    }, (items) => {
        document.getElementById('wsserver').value = items.webSocketServer;
    });
}





document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',save_options);