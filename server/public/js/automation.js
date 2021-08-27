const startBtn = document.getElementById('startTest');
const stopBtn = document.getElementById('stopTest');
const textarea = document.getElementById('urlList');
const progressbar = document.getElementById('progress');

const urllines = textarea.value.split('\n');
let urlcount = 0;
for (const line of urllines) {
  if (line !== '') {
    urlcount += 1;
  }
}

console.log(urlcount);


function resetStartBtn() {
  startBtn.innerHTML = 'Start Test';
  startBtn.disabled = false;
}

function disableStartBtn() {
  startBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> \
  Testing...'; 
  startBtn.disabled = true;
}


startBtn.addEventListener('click', () => {
  fetch('/automation/start')
    .then((response) => response.text())
    .then((data) => console.log(data));
  disableStartBtn();
});



stopBtn.addEventListener('click', () => {
  fetch('/automation/stop')
    .then((response) => response.text())
    .then((data) => console.log(data));
  resetStartBtn();
});

// connect to websocket to gather status infos
const ws = new WebSocket('ws://localhost:3031');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('WSMessage received:', message);
  if (message.action === 'updateUrl') {
    const percent = ((message.counter - 1) / urlcount) * 100;
    console.log(percent);
    progressbar.style.width = `${percent}%`;
    document.getElementById('progressText').innerText = `Testing ${message.url}`;
  } else if (message.action === 'finished') {
    resetStartBtn();
    progressbar.style.width = '100%';
    document.getElementById('progressText').innerText = 'Finished';
  } else if (message.action === 'setStatus') {
    if (message.running === true) {
      disableStartBtn();
      const percent = ((message.counter - 1) / urlcount) * 100;
      progressbar.style.width = `${percent}%`;
      document.getElementById('progressText').innerText = `Testing ${message.url}`;
    }
  }
};
