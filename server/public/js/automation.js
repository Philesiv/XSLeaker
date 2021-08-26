console.log('it works!');

const startBtn = document.getElementById('startTest');
const stopBtn = document.getElementById('stopTest');

startBtn.addEventListener('click', () => {
  fetch('/automation/start')
    .then((response) => response.text())
    .then((data) => console.log(data));
});


stopBtn.addEventListener('click', () => {
  fetch('/automation/stop')
  .then((response) => response.text())
  .then((data) => console.log(data));
});
