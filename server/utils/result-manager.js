// manages the results

const DBManager = require('./db-manager');

const results = {};
let activeTestID;
const usedHeaders = ['content-length', 'x-frame-options', 'x-content-type-options', 'cross-origin-opener-policy', 'cross-origin-resource-policy', 'content-security-policy', 'content-disposition'];

function setResults(result, stateId) {
  // normalize the results:
  // let headers = result.headers;
  // delete result.headers;
  const { headers, ...normResult } = result;
  for ( const header of usedHeaders) {
    normResult[header] = headers[header];
  }
  results[stateId] = {
    stateName: stateId,
    results: normResult,
  };

  console.log('results:', results);
  DBManager.setState(normResult, stateId, activeTestID);

  // update differences
  if (activeTestID !== undefined) {
    let differencesCount = 0;
    // setze differences von vorherigen test _> wir wissen erst bei neuen Test, dass test fertig ist
    for (const [key, value] of Object.entries(getDifferences())) {
      if (value === true) {
        differencesCount += 1;
      }
    }
    DBManager.updateDifferences(differencesCount, activeTestID);
  }
}

function getResults() {
  return results;
}

function getDifferences() {
  console.log(results);
  const differences = { };
  if (Object.keys(results).length > 0) {
    const states = Object.getOwnPropertyNames(results);
    const properties = Object.getOwnPropertyNames(results[states[0]].results);
    console.log('States: ', states);
    console.log('Props: ', properties);
    for (const property of properties) {
      for (let i = 1; i < states.length; i++) {
        // check if differences found already
        if (differences[property] === true) {
          continue;
        } else {
          differences[property] = (results[states[0]].results[property] !== results[states[i]].results[property]);
        }
      }
    }
  }
  return differences;
}

function getDBDifferences(dbResults) {
  const differences = {};
  const properties = Object.getOwnPropertyNames(dbResults[0]);
  console.log(properties);
  for (const property of properties) {
    console.log(property);
    if (property !== 'id' || property !== 'test_id') {
      for (let i = 1; i < dbResults.length; i++) {
        if (differences[property] !== true) {
          differences[property] = (dbResults[0][property] !== dbResults[i][property]);
        }
      }
    }
  }
  return differences;
}

// ToDo differences des vorherigen tests setzen und states in db speichern
function createNewTest(result, stateName, callback) {
  DBManager.createTest(result.currentUrl, (id) => {
    activeTestID = id;
    console.log('New active ID:', activeTestID);
    setResults(result, stateName);
    callback();
  });
}

module.exports = {
  setResults,
  getResults,
  getDifferences,
  createNewTest,
  getDBDifferences,
};
