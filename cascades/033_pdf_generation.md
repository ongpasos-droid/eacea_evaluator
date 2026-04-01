Add PDF generation using Puppeteer.

1. Install puppeteer: `npm install puppeteer`

2. Create the PDF export route in `server/routes/project.js` (or export.js):
   - GET /api/project/export/pdf
   - Uses Puppeteer to:
     a. Launch headless browser
     b. Navigate to the printable HTML endpoint (http://localhost:PORT/api/project/export/html)
     c. Wait for content to load
     d. Generate PDF with:
        - Format: A4
        - Print background: true
        - Margins: reasonable (20mm)
     e. Return PDF as download with Content-Disposition header
     f. Close browser
   - Handle errors gracefully (Puppeteer might not be available)

3. Add a "Exportar PDF" button to the UI toolbar, next to the JSON export button

Note: If Puppeteer installation fails on the server (common on minimal VPS), catch the error and return a helpful message suggesting to install chromium first: `sudo apt-get install chromium-browser`

Test:
1. Start server
2. Try the PDF endpoint: `curl -s -o /tmp/test.pdf http://localhost:3000/api/project/export/pdf && file /tmp/test.pdf`
3. If Puppeteer isn't available, at least verify the endpoint returns a helpful error
4. Kill server

Commit: "033: Add PDF generation with Puppeteer"
