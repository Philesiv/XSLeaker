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
  console.log('Params:', req.query);
  let urlfilter = '';
  if (req.query.urlfilter) {
    urlfilter = req.query.urlfilter.trim();
  }
  let differences = false;
  if (req.query.differences && req.query.differences === 'on') {
    console.log('differences filter on!');
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
  console.log('Params:', req.params.testid);
  dbManager.getStates(req.params.testid, (rows) => {
    for (let index = 0, len = rows.length; index < len; index++) {
      rows[index].ids = JSON.parse(rows[index].ids);
    }
    console.log('Found', rows.length, 'states');
    res.render('testresults', {
      title: 'Results', currentUrl: '/', results: rows, differences: ResultManager.getDBDifferences(rows),
    });
  });
});

router.get('/tests', (req, res) => {
  console.log(`res.locals.state: ${res.locals.state}`);
  const states = stateManager.getStates();
  let alert;
  if (req.session.alert) {
    alert = req.session.alert;
    req.session.alert = undefined;
  }
  res.render('setup', {
    title: 'Test', currentUrl: '/tests', states, alert,
  });
});

router.post('/tests',
  // use validator here
  body('stateSelect').toInt(),
  body('iframes').toInt(),
  body('httpStatusCode').toInt(),
  body('websockets').toInt(),
  body('corp').isIn(['', 'same-site', 'same-origin', 'cross-origin']),
  body('xContentType').isIn(['', 'nosniff']),
  body('coop').isIn(['', 'unsafe-none', 'same-origin-allow-popups', 'same-origin']),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const states = stateManager.getStates();
    console.log(req.body);
    let alert; let message; let
      state;
    switch (req.body.action) {
      case 'setState':
        if (isNaN(req.body.stateSelect) || typeof states[req.body.stateSelect] === 'undefined') {
          alert = 'State does not exist, please choose a valide state';
        } else {
          res.cookie('state', req.body.stateSelect);
          state = req.body.stateSelect;
          message = `State set to ${states[req.body.stateSelect].name}`;
        }
        break;

      case 'setProperties':
        state = res.locals.state;
        if (isNaN(req.body.iframes) || isNaN(req.body.httpStatusCode)) {
          alert = 'Failure, please check if all values are valide';
        } else {
          console.log(`New Iframe value: ${req.body.iframes}`);
          console.log(`New HTTP status code: ${req.body.httpStatusCode}`);
          console.log(`New WebSocket value: ${req.body.websockets}`);
          if (req.body.redirect !== undefined && req.body.redirect === 'on') {
            req.body.redirect = true;
          } else {
            req.body.redirect = false;
          }
          console.log(`New Redirect Value: ${req.body.redirect}`);
          const properties = {
            iframes: req.body.iframes,
            httpStatusCode: req.body.httpStatusCode,
            redirect: req.body.redirect,
            websockets: req.body.websockets,
            corp: req.body.corp,
            coop: req.body.coop,
            xContentType: req.body.xContentType,
          };
          stateManager.setProperties(state, properties);
        }
        break;

      default:
        break;
    }

    res.render('setup', {
      title: 'Results', currentUrl: '/tests', alert, message, states, state,
    });
  });

module.exports = router;
