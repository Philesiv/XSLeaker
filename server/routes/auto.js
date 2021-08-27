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
  console.log('COUNT:', urlcount);
  console.log(testurls);
  res.render('automation', {
    title: 'Automation', currentUrl: '/automation', testurls,
  });
});

router.post('/', async (req, res) => {
  let alert;
  let testurls = fs.readFileSync('./config/testurls.txt', 'utf-8');
  if (!req.files || Object.keys(req.files).length === 0) {
    alert = 'File not found';
  } else if (req.files.urlfile && req.files.urlfile.mimetype !== 'text/plain') {
    alert = 'Only text files allowed';
  } else {
    console.log('Files', req.files.urlfile);
    testurls = req.files.urlfile.data.toString('utf8');
    await req.files.urlfile.mv('./config/testurls.txt');
  }
  res.render('automation', {
    title: 'Automation', currentUrl: '/automation', alert, testurls,
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
