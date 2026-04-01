Set up SQLite database with better-sqlite3 for the EACEA Evaluator app.

Create `server/db/db.js` with:
1. Import better-sqlite3
2. Create/open database at `data/eacea_evaluator.db` (use path.join with __dirname for reliability)
3. Enable WAL mode for better concurrent reads
4. Create tables if they don't exist:

```sql
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  project_type TEXT,
  working_version_name TEXT,
  form_name TEXT,
  form_version TEXT,
  current_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  snapshot_type TEXT NOT NULL CHECK(snapshot_type IN ('autosave', 'manual_version')),
  label TEXT,
  json_data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS form_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  json_schema TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

5. Export the database instance
6. Ensure the `data/` directory exists before creating the DB

Test: Run `node -e "require('./server/db/db.js')"` from the project root and verify no errors. Check that `data/eacea_evaluator.db` is created.

Commit: "003: Setup SQLite database with table schema"
