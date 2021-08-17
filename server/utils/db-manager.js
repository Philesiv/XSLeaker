const sqlite3 = require('sqlite3').verbose();
const { param } = require('express-validator');
const fs = require('fs');
const { StringDecoder } = require('string_decoder');
// open database, creates database file if not already exists
const db = new sqlite3.Database('./db/results.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to results Database');
});
// enable foreign key support
db.get('PRAGMA foreign_keys = ON');
// init tables (if not exist)
db.serialize(() => {
  // read init file:
  const initSql = fs.readFileSync('./db/init.sql').toString();
  db.exec(initSql);
  db.all('SELECT name FROM sqlite_master WHERE type = "table"', (err, row) => {
    console.log(row);
    console.log(typeof (row));
  });
  // fill database with dummy data
  db.run(`INSERT INTO tests (url, differences)
            VALUES  ("test.org", 5),
                    ("google.com", 2),
                    ("noxsleak.de", 0)`)
    .all('SELECT * FROM tests', (err, rows) => {
      if (err) {
        throw err;
      }
      console.log(rows);
    });
  db.run(`INSERT INTO states (test_id, state_name, url, iframes, http_status_code, redirects, websockets,
                                content_length, x_frame_options, x_content_type_options, corp, coop, csp, content_disposition)
            VALUES  (1, "state 1", "test.org", 3, 200, 0, 0, 2100, null, null, null, null, null, null),
                    (1, "state 1", "test.org#test", 5, 201, 2, 0, 2100, null, null, null, null, null, null),
                    (1, "state 1","test.org", 3, 200, 0, 0, 2100, null, null, null, null, null, null),
                    (2, "state 1","test.org", 3, 200, 0, 0, 2100, null, null, null, null, null, null),
                    (2, "state 1","test.org", 3, 200, 0, 0, 2100, null, null, null, null, null, null),
                    (2, "state 1","test.org", 3, 200, 0, 0, 2100, null, null, null, null, null, null),
                    (3, "state 1","test.org", 3, 200, 0, 0, 2100, null, null, null, null, null, null),
                    (3, "state 1","test.org", 3, 200, 0, 0, 2100, null, null, null, null, null, null),
                    (3, "state 1","test.org", 3, 200, 0, 0, 2100, null, null, null, null, null, null),
                    (3, "state 1","test.org", 3, 200, 0, 0, 2100, null, null, null, null, null, null),
                    (3, "state 1","test.org", 3, 200, 0, 0, 2100, null, null, null, null, null, null)
            
            `)
    .all('SELECT * FROM states', (err, rows) => {
      if (err) {
        throw err;
      }
      console.log(rows);
    });
});

// ToDo: statement maybe needs escaping for url because it could contain % or underscores
function getTests(url, differences, callback) {
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

  db.all(sql, params, (err, rows) => {
    if (err) {
      throw err;
    }
    callback(rows);
  });
}

function createTest(url, callback) {
  console.log('URL:', url);
  const sql = 'INSERT INTO tests (url, differences) VALUES  (?,0)';
  // use function because arrow function not working here (DAFUCK WHY NOT?)
  db.run(sql, url, function (err) {
    if (err) {
      throw err;
    }
    console.log('ID', this.lastID);
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
        content_disposition)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const params = [
            activeTestID,
            stateName,
            result.currentUrl,
            result.iframes,
            result.httpStatusCode,
            result.redirects,
            result.websockets,
            result["content-length"],
            result["x-frame-options"],
            result["x-content-type-options"],
            result["cross-origin-resource-policy"],
            result["cross-origin-opener-policy"],
            result["content-security-policy"],
            result["content-disposition"]
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

// Cleanup on exit
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
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
};
