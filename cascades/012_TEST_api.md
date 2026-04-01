TEST CHECKPOINT: Verify all API endpoints work correctly.

Run a comprehensive API test:

1. Start server: `node server/index.js &` and wait 2 seconds

2. Test GET /api/project/current:
   - Should return 200 with valid JSON
   - JSON should have keys: form, projectMeta, sections
   - Sections should be an array with at least 1 item

3. Test POST /api/project/current:
   - Get current data, modify projectMeta.projectName to "API Test Project"
   - POST it back
   - GET again and verify name changed
   - Restore original name

4. Test POST /api/project/version:
   - Create a version with label "API Test Version"
   - Should return success with an ID

5. Test GET /api/project/versions:
   - Should return array with at least 1 version
   - Each version should have: id, label, created_at

6. Test GET /api/project/version/:id:
   - Use an ID from step 5
   - Should return full project data

7. Test GET /api/project/export/json:
   - Should return downloadable JSON

8. Kill server

Report each test as PASS or FAIL. If any fail, fix the issue in the route code.

Commit: "012: TEST - All API endpoints verified"
