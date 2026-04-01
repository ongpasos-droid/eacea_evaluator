Seed the database with initial project data from the HTML prototype.

Read the file `prototype/eacr_response_framework_prototype_v_2.html` and extract the `appData` JavaScript object from the `<script>` tag. This contains the full project JSON with form metadata, sections, questions, and criteria (miniPoints).

Create `server/db/seed.js` that:
1. Imports the database from `./db.js`
2. Contains the full appData object as a JavaScript constant (copy it exactly from the prototype)
3. Checks if a project already exists in the `projects` table
4. If no project exists, inserts one with:
   - name: appData.projectMeta.projectName
   - project_type: appData.projectMeta.projectType
   - working_version_name: appData.projectMeta.workingVersion
   - form_name: appData.form.name
   - form_version: appData.form.version
   - current_json: JSON.stringify(appData)
5. Also inserts the form template into `form_templates`
6. Logs what was inserted

Modify `server/index.js` to require `./db/seed.js` at startup (after db.js but before starting the server).

Add a script to package.json: "seed": "node server/db/seed.js"

Test: Run `npm run seed` and verify data is inserted. Then run `node -e "const db = require('./server/db/db.js'); console.log(db.prepare('SELECT id, name FROM projects').all())"` and confirm the project exists.

Commit: "004: Seed database with prototype project data"
