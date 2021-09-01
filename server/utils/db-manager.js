const sqlite3 = require('sqlite3').verbose();
const { param } = require('express-validator');
const fs = require('fs');
const { StringDecoder } = require('string_decoder');
// open database, creates database file if not already exists
const db = new sqlite3.Database('./db/results.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to Database');
});
// enable foreign key support
db.get('PRAGMA foreign_keys = ON');
// init tables (if not exist)
db.serialize(() => {
  // read init file:
  const initSql = fs.readFileSync('./db/init.sql').toString();
  db.exec(initSql);
});

// ToDo: statement maybe needs escaping for url because it could contain % or underscores
function getTests(url, differences, page, callback) {
  let sql = 'SELECT * FROM tests WHERE differences >= ?';
  const params = [];
  let minDifferences = 0;
  if (differences) {
    minDifferences = 1;
  }
  params.push(minDifferences);
  if (url !== '') {
    sql = `${sql}AND url LIKE ?`;
    url = `%${url}%`;
    params.push(url);
  }
  const offset = (page - 1) * 25;
  sql = `${sql} ORDER BY id LIMIT 25 OFFSET ?`;
  params.push(offset);
  db.all(sql, params, (err, rows) => {
    if (err) {
      throw err;
    }
    callback(rows);
  });
}

function getTestCount(url, differences, callback) {
  let sql = 'SELECT COUNT(*) AS count FROM tests WHERE differences >= ?';
  const params = [];
  let minDifferences = 0;
  if (differences) {
    minDifferences = 1;
  }
  params.push(minDifferences);
  if (url !== '') {
    sql = `${sql}AND url LIKE ?`;
    url = `%${url}%`;
    params.push(url);
  }
  db.get(sql, params, (err, rows) => {
    if (err) {
      throw err;
    }
    callback(rows);
  });
}

function createTest(url, callback) {
  const sql = 'INSERT INTO tests (url, differences) VALUES  (?,0)';
  // use function because arrow function not working here (DAFUCK WHY NOT?)
  db.run(sql, url, function (err) {
    if (err) {
      throw err;
    }
    callback(this.lastID);
  });
}

function getStates(id, callback) {
  const sql = 'SELECT * FROM states WHERE test_id = ?';
  db.all(sql, id, (err, rows) => {
    if (err) {
      throw err;
    }
    callback(rows);
  });
}

function setState(result, stateName, activeTestID) {
  const sql = `INSERT INTO states (
        test_id, 
        state_name, 
        url, 
        iframes, 
        http_status_code, 
        redirects, 
        websockets,
        content_length,
        x_frame_options,
        x_content_type_options,
        corp,
        coop,
        csp,
        content_disposition,
        ids)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const params = [
    activeTestID,
    stateName,
    result.currentUrl,
    result.iframes,
    result.httpStatusCode,
    result.redirects,
    result.websockets,
    result['content-length'],
    result['x-frame-options'],
    result['x-content-type-options'],
    result['cross-origin-resource-policy'],
    result['cross-origin-opener-policy'],
    result['content-security-policy'],
    result['content-disposition'],
    JSON.stringify(result.ids),
  ];
  db.run(sql, params, (err) => {
    if (err) {
      throw err;
    }
  });
}

function updateDifferences(differencesCount, activeTestID) {
  const sql = `Update tests
         SET differences = ?
         WHERE id = ?`;
  db.run(sql, differencesCount, activeTestID, (err) => {
    if (err) {
      throw err;
    }
  });
}

function clearHistory(callback) {
  // backup db
  fs.copyFile('./db/results.db', './db/results.db.bak', (err) => {
    if (err) throw err;
    // delete all data from db
    db.serialize(() => {
      const sql = "DELETE FROM states; DELETE FROM tests;";
      db.exec(sql, callback);
    });
  });
  
}

// Cleanup on exit
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection...');
    // start normal exit..
    process.exit();
  });
});



module.exports = {
  getTests,
  createTest,
  getStates,
  setState,
  updateDifferences,
  getTestCount,
  clearHistory,
};
