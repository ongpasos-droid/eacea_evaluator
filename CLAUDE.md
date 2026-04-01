# EACEA Evaluator - Project Context for Claude Code

## What This Project Is

An internal web application for writing and evaluating project proposals (Erasmus+, KA3, etc.). It allows a team to create a project, define evaluation sections with questions, configure scoring criteria per question, assign manual scores, manage versions, and export the project as JSON/PDF.

**Phase 1 is internal-only**: no authentication, no AI, no collaborative editing. Direct URL access by the team.

## Starting Point

There is an **HTML prototype** (`prototype/eacr_response_framework_prototype_v_2.html`) that already contains:
- The complete JSON data model (embedded in `appData`)
- Full CSS styling with dynamic section colors
- Functional UI with sidebar navigation, intake form, question config, criteria editing, and scoring panel
- Mobile-first responsive layout

**CRITICAL**: Do NOT rebuild from scratch. Use the prototype as the reference for UX, data model, and styling. Your job is to harden it into a real app with a backend.

## Technical Stack

- **Frontend**: HTML, CSS, vanilla JavaScript (modular files, no framework)
- **Backend**: Node.js + Express
- **Database**: SQLite via `better-sqlite3`
- **Infrastructure**: Ubuntu VPS, Nginx reverse proxy, PM2, SSL via Certbot
- **Utilities**: Puppeteer for PDF generation, Nodemailer for future email

## Project Structure

```
eacea_evaluator/
├── package.json
├── server/
│   ├── index.js          # Express app entry point
│   ├── db/
│   │   └── db.js         # SQLite connection + table creation
│   └── routes/
│       └── project.js    # All /api/project/* routes
├── public/
│   ├── index.html        # Main app HTML shell
│   ├── css/
│   │   └── styles.css    # All styles (extracted from prototype)
│   └── js/
│       ├── app.js        # Bootstrap, initial load, rerender orchestration
│       ├── api.js        # Fetch wrappers for all API endpoints
│       ├── state.js      # appState container, mutation helpers, dirty flag, autosave timer
│       └── ui/
│           ├── sidebar.js         # Navigation, section chips, expand/collapse, question switching
│           ├── intake.js          # Intake form rendering, input binding
│           ├── question-config.js # Question header, general config, question-level inputs, general rules
│           ├── criteria.js        # Criteria list rendering, add/edit/delete/reorder criteria
│           ├── scoring.js         # Scoring panel, score inputs, total recalculation
│           └── versions.js        # Saved versions list, open version, save version flow
├── prototype/
│   └── eacr_response_framework_prototype_v_2.html
└── data/
    └── eacea_evaluator.db  # SQLite database file (auto-created)
```

## Database Schema

### Table: `projects`
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
```

### Table: `project_snapshots`
```sql
CREATE TABLE IF NOT EXISTS project_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  snapshot_type TEXT NOT NULL CHECK(snapshot_type IN ('autosave', 'manual_version')),
  label TEXT,
  json_data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### Table: `form_templates`
```sql
CREATE TABLE IF NOT EXISTS form_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  json_schema TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## API Specification

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/project/current` | Return active project JSON |
| POST | `/api/project/current` | Save/update current project state |
| POST | `/api/project/version` | Create named manual version snapshot |
| GET | `/api/project/versions` | List all manual versions + latest autosave |
| GET | `/api/project/version/:id` | Return one snapshot JSON |
| GET | `/api/project/export/json` | Download current project as JSON file |
| GET | `/api/project/export/pdf` | Generate and download PDF (Phase 1: stub) |

### POST /api/project/current body:
```json
{ "projectData": { /* full project JSON */ } }
```

### POST /api/project/version body:
```json
{ "label": "Draft before partner review", "projectData": { /* full JSON */ } }
```

## Reference JSON Shape (Data Model)

```json
{
  "form": {
    "name": "KA3 Policy Support - European Youth Together",
    "version": "1.0",
    "publicationDate": "2026"
  },
  "projectMeta": {
    "projectName": "",
    "projectType": "",
    "workingVersion": ""
  },
  "savedVersions": [],
  "sections": [
    {
      "title": "1. Relevance",
      "questions": [
        {
          "code": "1.1",
          "title": "Background and general objectives",
          "prompt": "...",
          "maxScore": 10,
          "threshold": 6,
          "generalRules": ["..."],
          "scoreCaps": ["..."],
          "miniPoints": [
            {
              "title": "...",
              "maxScore": 1,
              "mandatory": true,
              "meaning": "...",
              "structure": "...",
              "relations": "...",
              "rules": "...",
              "score": 0
            }
          ]
        }
      ]
    }
  ]
}
```

**Important**: The internal property `miniPoints` stays in the JSON for compatibility, but the visible UI must say **"criterio" / "criterios"**.

## Frontend State Model

```javascript
const appState = {
  projectData: null,       // The full JSON object
  activeSectionIndex: 0,   // Which section is selected (0 = intake)
  activeQuestionIndex: 0,  // Which question within section
  expandedSectionIndex: 0, // Which sidebar section is expanded
  hasUnsavedChanges: false, // Dirty flag
  autosaveTimer: null,     // setTimeout reference
  lastSavedAt: null        // Timestamp of last save
};
```

## Color Context Logic

Sections have dynamic colors that must sync across all UI elements:
- Section 0 (Intake): `#3b82f6` (blue)
- Section 1 (Relevance): `#f59e0b` (amber)
- Section 2 (Quality): `#22c55e` (green)
- Section 3 (Impact): `#8b5cf6` (purple)
- Section 4 (Work Plan): `#ef4444` (red)

The active color affects: sidebar section chip, question config shell, criteria shell, scoring shell, toolbar header, total score box.

Use CSS custom property `--active-color` and update it via JS when the section changes.

## UI/UX Rules

1. **Terminology**: Use "criterio/criterios", "version", "guardar proyecto", "guardar version" in the UI. Never expose `miniPoints`.
2. **Color sync**: All modules must visually reflect the active section's color.
3. **Layout hierarchy**: Intake module > Question config > Criteria > Scoring (top to bottom in main area).
4. **Mobile-first**: CSS must work on mobile even though desktop is the primary use.
5. **Autosave**: After 20-30s of inactivity, on section/question switch, before unload.
6. **Manual versions**: Immutable snapshots, never overwritten.

## Coding Conventions

- Use ES modules (`type: "module"` in package.json for backend, regular script tags with module pattern for frontend)
- All state mutations go through helper functions in `state.js`
- All API calls go through `api.js`
- Each UI module exports a `render()` function
- Use `const` by default, `let` when reassignment is needed
- Descriptive variable names in English
- Comments in English
- Console errors: zero tolerance
- After every change, verify the server starts and the page loads

## Definition of Done (Per Task)

A task is done ONLY when:
1. The feature works in the browser
2. State persists correctly if required
3. No console errors appear
4. The UI updates consistently after the action
5. The feature survives page refresh if persistence is expected
6. The feature does not break existing rendering
7. The server starts without errors

## Progress Tracking

After completing each task, update the file `PROGRESS.md` at the project root:
```markdown
## Completed Tasks
- [x] TASK_ID: Brief description - DONE
- [ ] NEXT_TASK_ID: Brief description - PENDING
```

Also run `git add -A && git commit -m "CASCADE_ID: description"` after each successful task.
