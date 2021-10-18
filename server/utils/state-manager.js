const fs = require('fs');

let states;

function readStateFile() {
  states = JSON.parse(fs.readFileSync('./config/states.json', 'utf8'));
}

function getStates() {
  return states;
}
// ToDo: test the property values
function setProperties(state, properties) {
  if (properties.ids !== '') {
    // save ids as array and delete empty ids
    const ids = properties.ids.split(',').map((item) => item.trim()).filter((i) => i);
    properties.ids = ids;
  } else {
    properties.ids = [];
  }
  if (typeof states[state] !== 'undefined') {
    states[state].properties = properties;
  }
  fs.writeFileSync('./config/states.json', JSON.stringify(states, null, 2), (err) => {
    if (err) console.error(err);
  });
}

module.exports = {
  readStateFile,
  getStates,
  setProperties,
};
