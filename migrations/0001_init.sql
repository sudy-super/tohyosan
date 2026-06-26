CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  credits_per_voter INTEGER NOT NULL DEFAULT 100,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  label TEXT NOT NULL,
  position INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE ballots (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  voter_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(session_id, voter_id),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE ballot_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ballot_id TEXT NOT NULL,
  option_id INTEGER NOT NULL,
  num_votes INTEGER NOT NULL DEFAULT 0,
  credits_spent INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (ballot_id) REFERENCES ballots(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE
);
