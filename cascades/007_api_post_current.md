Implement the POST /api/project/current endpoint.

Edit `server/routes/project.js`:
1. Implement POST /current:
   - Read `req.body.projectData` (the full project JSON)
   - Validate that projectData exists and is an object
   - Get the current project: `SELECT id FROM projects ORDER BY updated_at DESC LIMIT 1`
   - If exists, UPDATE: set current_json = JSON.stringify(projectData), update name/project_type/working_version_name from projectData.projectMeta, set updated_at = datetime('now')
   - If not exists, INSERT a new project row
   - Return `{ success: true, updated_at: new Date().toISOString() }`
   - Wrap in try/catch, return 500 on error

Test:
1. Start server in background
2. Save current state: `curl -s http://localhost:3000/api/project/current > /tmp/test_project.json`
3. Post it back: `curl -s -X POST http://localhost:3000/api/project/current -H "Content-Type: application/json" -d "{\"projectData\": $(cat /tmp/test_project.json)}"`
4. Verify response has `success: true`
5. GET again and verify data is still intact
6. Kill server

Commit: "007: Implement POST /api/project/current"
