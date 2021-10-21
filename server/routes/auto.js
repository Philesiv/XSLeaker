const express = require('express');
const fs = require('fs');
const router = express.Router();
const autoManager = require('../utils/auto-manager');

router.get('/', (req, res) => {
  const testurls = fs.readFileSync('./config/testurls.txt', 'utf-8');
  const lines = testurls.split("\n");
  let urlcount = 0;
  for (const line of lines) {
    if (line.trim() !== '') {
      urlcount += 1;
    }
  }
   autoManager.getTimeouts();
  res.render('automation', {
    title: 'Automation',
    currentUrl: '/automation',
    testurls,
    timeouts: autoManager.getTimeouts(),
  });
});

router.post('/', async (req, res) => {
  console.log(req.body);
  let alert;
  let testurls = fs.readFileSync('./config/testurls.txt', 'utf-8');
  if (req.body.action === 'uploadFile') {
    if (!req.files || Object.keys(req.files).length === 0) {
      alert = 'File not found';
    } else if (req.files.urlfile && req.files.urlfile.mimetype !== 'text/plain') {
      alert = 'Only text files allowed';
    } else {
      testurls = req.files.urlfile.data.toString('utf8');
      await req.files.urlfile.mv('./config/testurls.txt');
    }
  } else if (req.body.action === 'setTimeouts') {
    const urlTimeout = parseInt(req.body.urlTimeout, 10);
    const testTimeout = parseInt(req.body.testTimeout, 10);
    if (Number.isNaN(urlTimeout)  || Number.isNaN(testTimeout) || urlTimeout < 500 || testTimeout < 500) {
      alert = 'Please provide valide timeouts. The minimal timeout is set to 500 ms.'
    } else {
      autoManager.setTimeouts(urlTimeout, testTimeout);
    }
  }
  res.render('automation', {
    title: 'Automation', currentUrl: '/automation', alert, testurls, timeouts: autoManager.getTimeouts(),
  });
});

router.get('/start', (req, res) => {
  autoManager.startTesting();
  res.send('OK');
});

router.get('/stop', (req,res) => {
  autoManager.stopTesting();
  res.send('OK');
});

module.exports = router;
