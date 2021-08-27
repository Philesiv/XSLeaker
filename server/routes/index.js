const express = require('express');
const { body, validationResult } = require('express-validator');
const ResultManager = require('../utils/result-manager');
const stateManager = require('../utils/state-manager');
const dbManager = require('../utils/db-manager');


const router = express.Router();

router.get('/', (req, res) => {
  res.render('results', {
    title: 'Results', currentUrl: '/', results: ResultManager.getResults(), differences: ResultManager.getDifferences(),
  });
});

router.get('/history', (req, res) => {
  let urlfilter = '';
  if (req.query.urlfilter) {
    urlfilter = req.query.urlfilter.trim();
  }
  let differences = false;
  if (req.query.differences && req.query.differences === 'on') {
    differences = true;
  }
  let page = 1;
  if (req.query.page) {
    page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
      page = 1;
    }
  }
  dbManager.getTests(urlfilter, differences, page, (rows) => {
    // convert date to iso string
    for (let index = 0, len = rows.length; index < len; index++) {
      rows[index].formatedDate = new Date(rows[index].date * 1000).toISOString();
    }
    dbManager.getTestCount(urlfilter, differences, (testcount) => {
      const pages = Math.ceil(testcount.count / 25);
      res.render('history', {
        title: 'Test History', currentUrl: '/history', rows, urlfilter, differences, pages, page,
      });
    });
  });
});

router.get('/history/:testid', (req, res) => {
  dbManager.getStates(req.params.testid, (rows) => {
    for (let index = 0, len = rows.length; index < len; index++) {
      rows[index].ids = JSON.parse(rows[index].ids);
    }
    res.render('testresults', {
      title: 'Results', currentUrl: '/', results: rows, differences: ResultManager.getDBDifferences(rows),
    });
  });
});

module.exports = router;
