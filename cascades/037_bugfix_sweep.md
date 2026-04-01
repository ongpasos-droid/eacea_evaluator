Final bugfix and quality sweep.

Do a thorough review of the entire codebase:

1. Check server/index.js:
   - All routes mounted correctly
   - Error handling middleware
   - Proper shutdown handling (SIGTERM/SIGINT)

2. Check all API routes:
   - Every route has try/catch
   - Proper HTTP status codes
   - Input validation
   - No SQL injection risks (using parameterized queries)

3. Check all frontend JS files:
   - No undefined function calls
   - All DOM element IDs match between HTML and JS
   - Event listeners properly bound (no duplicates from re-renders)
   - All functions referenced in app.js actually exist

4. Check CSS:
   - No missing classes
   - No broken color-mix() expressions
   - Media queries are properly closed

5. Fix any issues found.

6. Run the server and verify no errors:
   ```
   node server/index.js &
   sleep 2
   curl -s http://localhost:3000/api/project/current > /dev/null && echo "API OK" || echo "API FAIL"
   curl -s http://localhost:3000/ > /dev/null && echo "HTML OK" || echo "HTML FAIL"
   kill %1
   ```

7. Final git status - make sure everything is committed:
   ```
   git status
   git log --oneline -10
   ```

Commit: "037: Final bugfix sweep and quality check"
