Initialize the project repository structure for the EACEA Evaluator app.

Do the following in order:
1. Run `git init` if not already a git repo
2. Create `package.json` with:
   - name: "eacea-evaluator"
   - version: "1.0.0"
   - type: "commonjs"
   - scripts: { "start": "node server/index.js", "dev": "node --watch server/index.js" }
   - dependencies: { "express": "^4.18.0", "better-sqlite3": "^11.0.0", "cors": "^2.8.5" }
3. Create the directory structure:
   - server/
   - server/db/
   - server/routes/
   - public/
   - public/css/
   - public/js/
   - public/js/ui/
   - data/
   - prototype/
4. Copy the prototype HTML file to prototype/ if it exists
5. Create a `.gitignore` with: node_modules/, data/*.db, .cascade_*, *.log
6. Run `npm install`
7. Verify all directories exist and package.json is valid

Commit: "001: Initialize project structure and dependencies"
