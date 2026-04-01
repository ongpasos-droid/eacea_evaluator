FINAL TEST CHECKPOINT: Run comprehensive acceptance criteria verification.

This is the final acceptance test. Check ALL criteria from the Technical Handoff:

1. Start server: `node server/index.js &`
2. Wait 2 seconds

ACCEPTANCE CRITERIA CHECKLIST:

3. "The app loads the active project from SQLite":
   `curl -s http://localhost:3000/api/project/current | python3 -c "import sys,json; d=json.load(sys.stdin); assert 'sections' in d and len(d['sections']) > 0; print('PASS: Project loads from SQLite')" 2>/dev/null || echo "FAIL"`

4. "The app can edit intake fields":
   Test POST with modified projectMeta, verify it persists.

5. "The app can edit question config":
   Test modifying a question's title via the API.

6. "The app can edit criteria":
   Test modifying a criterion field.

7. "The app can edit manual scores":
   Test modifying a criterion's score field.

8. "Autosave works reliably":
   Test the autosave endpoint.

9. "Manual versions can be created and listed":
   Create a version, list all, verify.

10. "Saved versions can be reopened":
    Fetch a version by ID, verify full data.

11. "JSON export works":
    `curl -s -I http://localhost:3000/api/project/export/json | grep -i content-disposition`

12. "The app survives page refresh without losing latest saved state":
    Save data, restart server, GET data, verify it matches.

13. "Contextual section coloring remains coherent":
    Verify CSS has the color-mix rules and --active-color variable.

14. All JS files exist and have no syntax errors:
    ```
    node -e "const fs=require('fs'); const files=['public/js/state.js','public/js/api.js','public/js/app.js','public/js/ui/sidebar.js','public/js/ui/intake.js','public/js/ui/question-config.js','public/js/ui/criteria.js','public/js/ui/scoring.js','public/js/ui/versions.js']; let ok=true; files.forEach(f=>{try{new Function(fs.readFileSync(f,'utf8'));console.log('OK:',f)}catch(e){console.error('FAIL:',f,e.message);ok=false}}); if(ok)console.log('ALL JS SYNTAX OK'); else console.log('SOME JS FILES HAVE ERRORS');"
    ```

15. Express server starts cleanly:
    Check no errors in stdout.

16. Database has correct schema:
    `node -e "const db=require('./server/db/db.js'); ['projects','project_snapshots','form_templates'].forEach(t=>{try{db.prepare('SELECT COUNT(*) FROM '+t).get();console.log('OK:',t)}catch(e){console.error('FAIL:',t)}})"`

17. Kill server

Generate a final report summarizing PASS/FAIL for each criterion.
If all pass, create a `DEPLOYMENT_READY.md` file.
If some fail, list what needs fixing.

Commit: "036: FINAL TEST - Acceptance criteria verification"
