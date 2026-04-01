Implement the GET /api/project/versions endpoint.

Edit `server/routes/project.js`:
1. Implement GET /versions:
   - Get current project ID
   - Query all manual versions: `SELECT id, label, snapshot_type, created_at FROM project_snapshots WHERE project_id = ? AND snapshot_type = 'manual_version' ORDER BY created_at DESC`
   - Optionally also get the latest autosave: `SELECT id, label, snapshot_type, created_at FROM project_snapshots WHERE project_id = ? AND snapshot_type = 'autosave' ORDER BY created_at DESC LIMIT 1`
   - Return `{ versions: [...], latestAutosave: {...} | null }`

Test:
1. Start server
2. `curl -s http://localhost:3000/api/project/versions`
3. Verify it returns a versions array (should have the test version from cascade 008)
4. Kill server

Commit: "009: Implement GET /api/project/versions"
