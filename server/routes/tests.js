const express = require('express');
const { body, validationResult } = require('express-validator');
const stateManager = require('../utils/state-manager');
const router = express.Router();

// check if state is set and valide
router.use(function(req, res, next){
    console.log("called use @ test");
    let states = stateManager.getStates();
    if(res.locals.state === undefined){
        console.log('state not set, redirecting...');
        req.session.alert = "State not set, please choose a state";
        
        res.redirect('/tests');
    }else{
        
        next();
    }
});


router.get('/iframes', (req, res) => {
    let states = stateManager.getStates();
    console.log('Cookies: ', req.cookies);
    if(states[res.locals.state].properties.redirect === true){
        res.redirect('http://example.com/');
    }else{
        res.status(states[res.locals.state].properties.httpStatusCode);
        res.render('tests/iframes', {title: 'Testpage', currentUrl: '/tests', states});
    }
    
});


module.exports = router;