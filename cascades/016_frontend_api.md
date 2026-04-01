Create the API client module at public/js/api.js.

This module handles all communication with the backend:

```javascript
const API_BASE = '/api/project';

async function fetchCurrentProject() {
  try {
    const response = await fetch(`${API_BASE}/current`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return null;
  }
}

async function saveCurrentProject() {
  if (!appState.projectData) return false;
  try {
    const response = await fetch(`${API_BASE}/current`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectData: appState.projectData })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    markClean();
    console.log('Project saved at', result.updated_at);
    return true;
  } catch (error) {
    console.error('Failed to save project:', error);
    return false;
  }
}

async function createVersion(label) {
  if (!appState.projectData) return null;
  try {
    const response = await fetch(`${API_BASE}/version`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, projectData: appState.projectData })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to create version:', error);
    return null;
  }
}

async function fetchVersions() {
  try {
    const response = await fetch(`${API_BASE}/versions`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch versions:', error);
    return { versions: [], latestAutosave: null };
  }
}

async function fetchVersion(id) {
  try {
    const response = await fetch(`${API_BASE}/version/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch version:', error);
    return null;
  }
}

async function triggerAutosave() {
  if (!appState.projectData || !appState.hasUnsavedChanges) return;
  try {
    await fetch(`${API_BASE}/autosave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectData: appState.projectData })
    });
  } catch (error) {
    console.error('Autosave failed:', error);
  }
}
```

Commit: "016: Create api.js with backend communication"
