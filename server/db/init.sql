PRAGMA foreign_keys = ON;
DROP TABLE IF EXISTS states;
DROP TABLE IF EXISTS tests;

CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY,
    date INTEGER DEFAULT (strftime('%s','now')),
    url TEXT NOT NULL,
    differences INTEGER
);

CREATE TABLE IF NOT EXISTS states (
   id INTEGER PRIMARY KEY,  
   test_id INTEGER NOT NULL,
   state_name TEXT,
   url TEXT,
   iframes INTEGER,
   http_status_code INTEGER,
   redirects INTEGER,
   websockets INTEGER,
   content_length INTEGER,
   x_frame_options TEXT,
   x_content_type_options TEXT,
   corp TEXT,
   coop TEXT,
   csp TEXT,
   content_disposition TEXT,
   FOREIGN KEY (test_id)
        REFERENCES tests (id) 
);