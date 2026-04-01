Implement the GET /api/project/current endpoint.

Edit `server/routes/project.js`:
1. Import the database from `../db/db.js`
2. Implement GET /current:
   - Query: `SELECT * FROM projects ORDER BY updated_at DESC LIMIT 1`
   - If found, parse `current_json` and return it as JSON response
   - If not found, return 404 with `{ error: "No project found" }`
   - Wrap in try/catch, return 500 on error

Test:
1. Start server: `node server/index.js &`
2. Run: `curl -s http://localhost:3000/api/project/current | head -c 500`
3. Verify it returns valid JSON with form, projectMeta, sections keys
4. Kill server

Commit: "006: Implement GET /api/project/current"
