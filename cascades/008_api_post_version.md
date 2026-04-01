Implement the POST /api/project/version endpoint.

Edit `server/routes/project.js`:
1. Implement POST /version:
   - Read `req.body.label` (string, optional - auto-generate if empty like "Version YYYY-MM-DD HH:mm")
   - Read `req.body.projectData` (the full project JSON)
   - Get the current project ID
   - INSERT into project_snapshots: project_id, snapshot_type='manual_version', label, json_data=JSON.stringify(projectData), created_at=datetime('now')
   - Return `{ success: true, id: result.lastInsertRowid, label: label }`
   - Wrap in try/catch

Test:
1. Start server
2. Get current project: `PDATA=$(curl -s http://localhost:3000/api/project/current)`
3. Create version: `curl -s -X POST http://localhost:3000/api/project/version -H "Content-Type: application/json" -d "{\"label\": \"Test version 1\", \"projectData\": $PDATA}"`
4. Verify response has success and id
5. Kill server

Commit: "008: Implement POST /api/project/version"
