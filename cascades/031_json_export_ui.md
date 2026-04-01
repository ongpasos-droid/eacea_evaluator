Add a JSON export button to the UI that downloads the project from the backend.

1. In `public/index.html` or via JavaScript, add an "Exportar JSON" button in the toolbar area:
   ```html
   <button class="btn-secondary" id="exportJsonBtn" type="button">Exportar JSON</button>
   ```

2. In `public/js/app.js`, add a function to handle the export:
   ```javascript
   function setupExportButton() {
     const btn = document.getElementById('exportJsonBtn');
     if (!btn) return;
     btn.addEventListener('click', () => {
       // Trigger download via the API endpoint
       window.open('/api/project/export/json', '_blank');
     });
   }
   ```
   Call `setupExportButton()` from `initApp()`.

3. Verify the export endpoint returns a downloadable JSON file with correct headers.

Test:
1. Start server
2. `curl -s -D- http://localhost:3000/api/project/export/json | head -5`
3. Verify Content-Disposition header has a filename
4. Kill server

Commit: "031: Add JSON export button to UI"
