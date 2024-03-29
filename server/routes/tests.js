const express = require('express');
const { body, validationResult } = require('express-validator');
const stateManager = require('../utils/state-manager');

const router = express.Router();

// check if state is set and valide
router.use('/testsite', (req, res, next) => {
  // const states = stateManager.getStates();
  if (res.locals.state === undefined) {
    req.session.alert = 'State not set, please choose a state';
    res.redirect('/tests');
  } else {
    next();
  }
});

router.get('/', (req, res) => {
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

router.post('/',
  // use validator here
  body('stateSelect').toInt(),
  body('iframes').toInt(),
  body('httpStatusCode').toInt(),
  body('websockets').toInt(),
  body('corp').isIn(['', 'same-site', 'same-origin', 'cross-origin']),
  body('xContentType').isIn(['', 'nosniff']),
  body('coop').isIn(['', 'unsafe-none', 'same-origin-allow-popups', 'same-origin']),
  body('csp').trim(),
  body('ids').trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const states = stateManager.getStates();
    let alert; let message; let state;
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
        console.log('CSP:', req.body.csp);
        console.log('IDS:', req.body.ids);
        if (isNaN(req.body.iframes) || isNaN(req.body.httpStatusCode)) {
          alert = 'Failure, please check if all values are valide';
        } else {
          if (req.body.redirect !== undefined && req.body.redirect === 'on') {
            req.body.redirect = true;
          } else {
            req.body.redirect = false;
          }
          // console.log(`New Redirect Value: ${req.body.redirect}`);
          const properties = {
            iframes: req.body.iframes,
            httpStatusCode: req.body.httpStatusCode,
            redirect: req.body.redirect,
            websockets: req.body.websockets,
            corp: req.body.corp,
            coop: req.body.coop,
            xContentType: req.body.xContentType,
            csp: req.body.csp,
            ids: req.body.ids,
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

router.get('/testsite', (req, res) => {
  const states = stateManager.getStates();
  const properties = states[res.locals.state].properties;
  if (properties.redirect === true) {
    res.redirect('http://example.com/');
  } else {
    res.status(properties.httpStatusCode);
    if (properties.coop !== '' && properties.coop !== undefined) {
      res.header('Cross-Origin-Opener-Policy', properties.coop);
    }
    if (properties.corp !== '' && properties.corp !== undefined) {
      res.header('Cross-Origin-Resource-Policy', properties.corp);
    }
    if (properties.xContentType !== '' && properties.xContentType !== undefined) {
      res.header('X-Content-Type-Options', properties.xContentType);
    }
    if (properties.csp !== '' && properties.csp !== undefined) {
      res.header('Content-Security-Policy', properties.csp);
    }
    res.render('tests/testsite', { title: 'Testpage', currentUrl: '/tests', states });
  }
});

module.exports = router;
