Create a printable HTML template for the project.

Create `server/routes/export.js` (or add to existing project routes) with a GET /api/project/export/html endpoint that:

1. Reads the current project JSON from the database
2. Generates a clean, printable HTML page with:
   - Project name, type, and version as header
   - Each section as a styled section
   - Each question with its code, title, prompt, and configuration
   - Each criterion with all its fields (meaning, structure, relations, rules)
   - Scores displayed inline
   - Clean print-friendly CSS (no sidebar, no interactive elements)
3. Uses inline CSS for portability (the HTML should look good when saved as a standalone file)
4. Returns the HTML with Content-Type: text/html

The printable template should look professional:
- Use the section colors as headers
- Show scores with visual indicators
- Include totals per question
- Clean typography (system fonts)

Mount this route in server/index.js if creating a new route file.

Test:
1. Start server
2. `curl -s http://localhost:3000/api/project/export/html | head -30`
3. Verify it returns valid HTML with project content
4. Kill server

Commit: "032: Create printable HTML export template"
