// load state file
const stateManager = require('./utils/state-manager');
stateManager.readStateFile();


// express stuff down here

const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
const routes = require('./routes/index');
const testRouter = require('./routes/tests');
const autoRouter = require('./routes/auto')
const cookieParser = require('cookie-parser');
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: "th1s1sfuck1ngS3cr3t", resave: false, saveUninitialized: false }));
app.use(express.static('public'));
app.use('/automation', fileUpload());

// state cookie middleware -> deletes uncorrect state-cookies.
app.use(function (req, res, next) {
    if (req.cookies.state !== undefined){
        let states = stateManager.getStates();
        // delete cookie if state is not defined
        let state = parseInt(req.cookies.state);
        if (typeof states[state] === 'undefined'){
            res.clearCookie('state');
        }else{
            console.log("new state = " + state);
            res.locals.state =  state;
        }    
    }
    next();
});

app.use('/', routes);
app.use('/tests/', testRouter);
app.use('/automation/', autoRouter);

module.exports = app;


