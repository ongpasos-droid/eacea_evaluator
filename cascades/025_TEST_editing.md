TEST CHECKPOINT: Verify the full editing workflow works.

This is a comprehensive integration test. Start the server and check everything:

1. Start server: `node server/index.js &`
2. Wait 2 seconds

3. Verify the page serves correctly:
   `curl -s http://localhost:3000/ | grep -c "EACEA"` (should be > 0)

4. Verify all JS files load without syntax errors. Create a quick test:
   ```
   node -e "
   // Test that each JS file has valid syntax
   const fs = require('fs');
   const files = [
     'public/js/state.js', 'public/js/api.js', 'public/js/app.js',
     'public/js/ui/sidebar.js', 'public/js/ui/intake.js',
     'public/js/ui/question-config.js', 'public/js/ui/criteria.js',
     'public/js/ui/scoring.js', 'public/js/ui/versions.js'
   ];
   files.forEach(f => {
     try {
       const code = fs.readFileSync(f, 'utf8');
       new Function(code);
       console.log('OK:', f);
     } catch(e) {
       console.error('SYNTAX ERROR in', f, ':', e.message);
     }
   });
   "
   ```

5. Test API round-trip:
   - GET current project
   - Modify the project name
   - POST it back
   - GET again and verify the change persisted
   - Create a manual version
   - List versions and verify it appears
   - Restore the version and verify data

6. Check that index.html references all JS files in the correct order:
   `grep "script" public/index.html`

7. Kill server

Fix any issues found. Common problems:
- Missing function declarations (check each .js file exports what others expect)
- Script load order issues (state.js and api.js must load before UI modules)
- Syntax errors in template literals

Commit: "025: TEST - Full editing workflow verified"
