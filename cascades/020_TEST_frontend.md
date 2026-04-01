TEST CHECKPOINT: Verify the frontend loads and connects to the API.

1. Start the server: `node server/index.js &`
2. Wait 2 seconds
3. Use curl to fetch the page: `curl -s http://localhost:3000/ | head -50`
4. Verify it returns HTML with the correct structure
5. Verify CSS file is accessible: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/css/styles.css`
6. Verify all JS files are accessible:
   - `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/js/state.js`
   - `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/js/api.js`
   - `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/js/app.js`
   - `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/js/ui/sidebar.js`
   - `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/js/ui/intake.js`
   - All should return 200
7. Test that API still works: `curl -s http://localhost:3000/api/project/current | python3 -c "import sys,json; d=json.load(sys.stdin); print('Sections:', len(d.get('sections',[]))); print('OK')" 2>/dev/null || echo "JSON parse failed"`
8. Kill server

If any JS file returns 404, check the file exists in public/js/ or public/js/ui/.
If the HTML doesn't reference the CSS/JS files correctly, fix the paths in index.html.

Commit: "020: TEST - Frontend files accessible and API connected"
