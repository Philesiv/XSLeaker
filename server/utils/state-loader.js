const fs = require('fs');

let states; 

function readStateFile (){
    states = JSON.parse(fs.readFileSync('./config/states.json', 'utf8'));
}

function getStates(){
    return states;
}

module.exports = {
    readStateFile: readStateFile,
    getStates: getStates
};