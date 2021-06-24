const WebSocket = require('ws');

const socketServer = new WebSocket.Server({port: 3030});


const dummyResult = {
    'action': 'getResults',
    'results': [
    {
        'name': 'iframe',
        'values': [1,25]
    }
]};
/*
let results = {
    'action': 'getResults',
    'results': {
        'iframe': []
    }
};
*/
let results = {};

exports.results = results;

let connectionCount = 0;

socketServer.on('connection', (socketClient) => {
    console.log('connected!');
    console.log('Number of clients: ', socketServer.clients.size);
    socketClient.stateName = 'state '  + (++connectionCount);
    socketClient.id = connectionCount;
    console.log('Set state name to: ' + socketClient.stateName );
    socketClient.send(JSON.stringify({action: "getStateName", value: socketClient.stateName }))
    socketClient.on('message', (message) => {
        console.log(JSON.parse(message));
        jsonMessage = JSON.parse(message);
        if (jsonMessage.action === "getResults" ){
            socketClient.send(JSON.stringify(results));
        }
        else if (jsonMessage.action === "setResults") {
            console.log("results received!");
            /*
            // check if exists
            if (results.results.hasOwnProperty(jsonMessage.name) && Array.isArray(results.results[jsonMessage.name])){
                console.log("Found array :)");
                results.results[jsonMessage.name].push(jsonMessage.value);
            }else {
                results.results[jsonMessage.name] = [jsonMessage.value];
            }
            */
            results[socketClient.id] = {
                'stateName': socketClient.stateName,
                'results': jsonMessage.values
            };
            console.log(results);
        }
        else if (jsonMessage.action === "changeSite") {
            //broadcast changeSite event
            socketServer.clients.forEach((client) => {
                if (client !== socketClient && client.readyState === WebSocket.OPEN){
                    client.send(message);
                }
            });
        }
        else if (jsonMessage.action === "setStateName"){
            socketClient.stateName = jsonMessage.value;
            console.log("New state name: " + socketClient.stateName);
            
        }
    });



    socketClient.on('close', (socketClient) => {
        console.log('closed');
        console.log('Number of clients: ', socketServer.clients.size);

    });
});


// load state file
const stateLoader = require('./utils/state-loader');
stateLoader.readStateFile();


// express stuff down here

const express = require('express');
var session = require('express-session');
const path = require('path');
const routes = require('./routes/index');
const testRouter = require('./routes/tests');
var cookieParser = require('cookie-parser');
const fs = require('fs');
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({secret: "th1s1sfuck1ngS3cr3t", resave: false, saveUninitialized: false}));
app.use(express.static('public'));

// state cookie middleware -> deletes uncorrect state-cookies.
app.use(function (req, res, next) {
    if (req.cookies.state !== undefined && !isNaN(req.cookies.state)){
        let states = stateLoader.getStates();
        // delete cookie if state is not defined
        state = parseInt(req.cookies.state);
        if (typeof states[state] === 'undefined'){
            res.clearCookie('state');
        }else{
            res.locals.state =  state;
        }    
    }
    next();
});


app.use('/', routes);
app.use('/tests/', testRouter);



const port = 3000;


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

