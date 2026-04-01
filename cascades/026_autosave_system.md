Implement the complete autosave system.

Update `public/js/state.js` to ensure the autosave logic is complete:
1. `scheduleAutosave()` should call `triggerAutosave()` from api.js after 25 seconds of inactivity
2. Autosave should also trigger on section/question switch (already in sidebar.js switchToSection/switchToQuestion)
3. Add a `beforeunload` handler that saves if there are unsaved changes

Update `server/routes/project.js` to add the POST /autosave route if not already present:
- Accepts `{ projectData }` in body
- Saves to project_snapshots with snapshot_type='autosave'
- Limits autosaves to last 10 per project (delete older ones)
- Also updates the current project state (POST /current logic)

Add a save status indicator to the UI:
1. In `public/index.html`, add a small status element in the toolbar area:
   `<span id="saveStatus" style="font-size:12px;color:var(--muted);"></span>`
2. Update the status text in api.js after saves:
   - After successful save: "Guardado a las HH:MM"
   - After autosave: "Autoguardado a las HH:MM"
   - When dirty: "Cambios sin guardar"
3. Create a function `updateSaveStatus(text)` that updates the element

Test:
1. Start server
2. Verify POST /autosave works: `curl -s -X POST http://localhost:3000/api/project/autosave -H "Content-Type: application/json" -d '{"projectData": {"test": true}}'`
3. Kill server

Commit: "026: Implement autosave system with status indicator"
