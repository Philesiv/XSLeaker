const express = require('express');
const {results} = require('../app.js');
const { body, validationResult } = require('express-validator');
const testRouter = require('./tests');

const router = express.Router();

// ToDo save states with properties to json file
let states = [
    {
        name: 'State 1',
        properties: {
            iframes: 0,
            httpStatusCode: 200
        }
    },
    {
        name: 'State 2',
        properties: {
            iframes: 1,
            httpStatusCode: 200
        }
    },
    {
        name: 'State 3',
        properties: {
            iframes: 10,
            httpStatusCode: 404
        }
    }
];

router.get('/', (req, res) => {
    console.log(Object.keys(results).length);
    res.render('results', {title: 'Results', currentUrl: '/' ,results});
});

router.get('/tests', (req, res) => {
    console.log(req.session.alert);
    var alert;
    if (req.session.alert){
        alert = req.session.alert;
        req.session.alert = undefined;
    }
    console.log(res.locals.state);
    res.render('setup', {title: 'Results', currentUrl: '/tests', results, states, alert: alert});
});

router.post('/tests',
    // use validator here
    body('state').toInt(),
    (req, res) => {
        console.log(req.body);
        var alert, message, state;
        if(isNaN(req.body.state) || typeof states[req.body.state] === 'undefined'){
            alert = "State does not exist, please choose a valide state";
        }else{
            res.cookie('state', req.body.state);
            state = req.body.state;
            message = "State set to " + states[req.body.state].name;
        }
        res.render('setup', {title: 'Results', currentUrl: '/tests', results, alert: alert, message: message, states, state: state});
});

/*
// check state cookie for alle requests in /tests
router.all('/tests/*', function(req, res, next){
    if(req.cookies.state === undefined || typeof states[res.locals.state] === 'undefined'){
        req.clearkCookie(state);
        console.log('state not set, redirecting...')
        res.redirect('/tests');
    }else{
        next();
    }
});

router.get('/tests/iframes', (req, res) => {
    res.statusCode()
    console.log('Cookies: ', req.cookies);
    res.render('tests/iframes', {title: 'Results', currentUrl: '/tests', results, states});

});
*/

module.exports = router;
