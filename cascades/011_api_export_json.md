Implement the GET /api/project/export/json endpoint.

Edit `server/routes/project.js`:
1. Implement GET /export/json:
   - Get current project with full JSON
   - Set headers for file download:
     - Content-Type: application/json
     - Content-Disposition: attachment; filename="eacea_project_export_TIMESTAMP.json"
   - Send the JSON data
2. Also add a POST /autosave endpoint for future use:
   - Similar to POST /version but with snapshot_type='autosave'
   - Limit autosaves: delete old autosaves keeping only the last 10

Test:
1. Start server
2. `curl -s -I http://localhost:3000/api/project/export/json | head -5`
3. Verify Content-Disposition header is present
4. Kill server

Commit: "011: Implement JSON export and autosave endpoints"
