const express = require('express');
const {results} = require('../app.js');
const { body, validationResult } = require('express-validator');
const stateLoader = require('../utils/state-loader');
const router = express.Router();

// check if state is set and valide
router.use(function(req, res, next){
    let states = stateLoader.getStates();
    if(res.locals.state === undefined){
        console.log('state not set, redirecting...');
        req.session.alert = "State not set, please choose a state";
        res.redirect('/tests');
    }else{
        console.log("called use");
        next();
    }
});


router.get('/iframes', (req, res) => {
    let states = stateLoader.getStates();
    console.log('Cookies: ', req.cookies);
    res.status(states[state].properties.httpStatusCode);
    res.render('tests/iframes', {title: 'Results', currentUrl: '/tests', results, states});

});

module.exports = router;