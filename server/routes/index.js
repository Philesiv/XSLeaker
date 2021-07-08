const express = require('express');
const ResultManager = require('../utils/result-manager');
const { body, validationResult } = require('express-validator');
const stateManager = require('../utils/state-manager');

const router = express.Router();


router.get('/', (req, res) => {
    res.render('results', {title: 'Results', currentUrl: '/' ,results: ResultManager.getResults(), differences: ResultManager.getDifferences()});
});

router.get('/tests', (req, res) => {
    console.log("res.locals.state: " + res.locals.state);
    let states = stateManager.getStates();
    var alert;
    if (req.session.alert){
        alert = req.session.alert;
        req.session.alert = undefined;
    }
    res.render('setup', {title: 'Results', currentUrl: '/tests', states, alert: alert});
});

router.post('/tests',
    // use validator here
    body('stateSelect').toInt(),
    body('iframes').toInt(),
    body('httpStatusCode').toInt(),
    (req, res) => {

        let states = stateManager.getStates();
        console.log(req.body);
        let alert, message, state;
        switch(req.body.action) {
            case 'setState':
                if(isNaN(req.body.stateSelect) || typeof states[req.body.stateSelect] === 'undefined'){
                    alert = "State does not exist, please choose a valide state";
                }else{
                    res.cookie('state', req.body.stateSelect);
                    state = req.body.stateSelect;
                    message = "State set to " + states[req.body.stateSelect].name;
                }
            break;
            case 'setProperties':
                state = res.locals.state;
                if(isNaN(req.body.iframes) || isNaN(req.body.httpStatusCode)){
                    alert = "Failure, please check if all values are valide";
                }else{
                    console.log("New Iframe Value: "+ req.body.iframes );
                    console.log("New HTTP status code: "+ req.body.httpStatusCode );
                    if( req.body.redirect !== undefined && req.body.redirect === 'on'){
                        req.body.redirect = true;
                    }else{
                        req.body.redirect = false;
                    }
                    console.log("New Redirect Value: "+ req.body.redirect );
                    properties = {
                        iframes: req.body.iframes,
                        httpStatusCode: req.body.httpStatusCode,
                        redirect: req.body.redirect
                    };
                    stateManager.setProperties(state, properties);
                }
        }
        
       res.render('setup', {title: 'Results', currentUrl: '/tests', alert: alert, message: message, states, state: state});
});



module.exports = router;
