const express = require('express');
const { body, validationResult } = require('express-validator');
const stateManager = require('../utils/state-manager');

const router = express.Router();

// check if state is set and valide
router.use((req, res, next) => {
  // const states = stateManager.getStates();
  if (res.locals.state === undefined) {
    console.log('state not set, redirecting...');
    req.session.alert = 'State not set, please choose a state';

    res.redirect('/tests');
  } else {
    next();
  }
});

router.get('/testsite', (req, res) => {
  const states = stateManager.getStates();
  const properties = states[res.locals.state].properties;
  console.log('Cookies: ', req.cookies);
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
    res.render('tests/iframes', { title: 'Testpage', currentUrl: '/tests', states });
  }
});

module.exports = router;
