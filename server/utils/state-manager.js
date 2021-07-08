const fs = require('fs');

let states; 

function readStateFile (){
    states = JSON.parse(fs.readFileSync('./config/states.json', 'utf8'));
}

function getStates(){
    return states;
}
// ToDo: test the property values
function setProperties(state, properties){
   if(typeof states[state] !== 'undefined'){
       states[state].properties = properties;
    }
    fs.writeFileSync('./config/states.json', JSON.stringify(states, null, 2), (err) => {
        if(err) console.error(err);
    }); 
}

module.exports = {
    readStateFile: readStateFile,
    getStates: getStates,
    setProperties: setProperties
};