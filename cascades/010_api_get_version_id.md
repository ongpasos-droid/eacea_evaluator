Implement the GET /api/project/version/:id endpoint.

Edit `server/routes/project.js`:
1. Implement GET /version/:id:
   - Get the snapshot: `SELECT * FROM project_snapshots WHERE id = ?`
   - If found, parse json_data and return `{ id, label, snapshot_type, created_at, projectData: JSON.parse(json_data) }`
   - If not found, return 404

Test:
1. Start server
2. Get versions list: `curl -s http://localhost:3000/api/project/versions`
3. Take the first version ID and fetch it: `curl -s http://localhost:3000/api/project/version/1 | head -c 300`
4. Verify it returns full project data
5. Kill server

Commit: "010: Implement GET /api/project/version/:id"
