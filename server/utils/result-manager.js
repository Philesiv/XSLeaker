// Manages the results

const { urlencoded } = require("express");
const DBManager = require('./db-manager'); 

let results = {};
let activeTestID; 

function setResults(result, stateId){
    console.log(result);
    results[stateId] = {
        'stateName': stateId,
        'results': result
    };

}

function getResults(){
    return results;
}

function getDifferences(){
    console.log(results);
    let differences = { headers: {}};
    if(Object.keys(results).length > 0){
        let states = Object.getOwnPropertyNames(results);
        let properties = Object.getOwnPropertyNames(results[states[0]].results);
        let availableHeaders = new Set();
        for(const state of states){
            let stateHeaders = Object.getOwnPropertyNames(results[state].results.headers);
            stateHeaders.forEach(item => availableHeaders.add(item));
        }
        console.log(availableHeaders);
        console.log("States: ", states);
        console.log("Props: ", properties);
        for(const property of properties){
            console.log(property);
            for (let i = 1; i < states.length; i++){
                // check if differences found already
                if(differences[property] === true){
                    continue;
                }
                if (property === 'redirects'){
                    differences[property] = (results[states[0]].results[property].length !== results[states[i]].results[property].length);
                }else if(property === 'headers'){
                    console.log(results[states[i]].results[property]);
                    console.log(availableHeaders);
                    for(const header of availableHeaders){
                        console.log(header);
                        if(differences[property][header] === true){
                            continue;
                        }
                        differences[property][header] = (results[states[0]].results[property][header] !== results[states[i]].results[property][header]);
                        //console.log(header);
                        if(header === 'content-length'){
                            console.log("Content-Length Found!!!!");
                        }
                    }
                    
                }else{
                    differences[property] = (results[states[0]].results[property] !== results[states[i]].results[property]);
                }
                
                console.log(results[states[i]].results[property]);
            }
        }
        
        // check if all headers from first
    }
    console.log(differences);
    return differences;
}

// ToDo differences des vorherigen tests setzen
function createNewTest(url){
    if(activeTestID !== undefined){
        //setze differences von vorherigen test _> wir wissen erst bei neuen Test, dass test fertig ist.    
    }
    DBManager.createTest(url, (id) => {
        activeTestID = id;
        console.log("New active ID:", activeTestID);
    });
}

module.exports = {
    setResults: setResults,
    getResults: getResults,
    getDifferences: getDifferences,
    createNewTest: createNewTest
};