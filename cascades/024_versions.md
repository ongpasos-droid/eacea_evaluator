Implement the versions module at public/js/ui/versions.js.

This module handles:
1. Rendering the saved versions list in the intake card
2. Save version button functionality
3. Open/restore a saved version

```javascript
function renderVersions() {
  const container = document.getElementById('savedVersionsContainer');
  if (!container) return;

  // Only show versions when on intake (section 0)
  if (appState.activeSectionIndex !== 0) return;

  // Fetch versions from API
  fetchVersions().then(data => {
    const versions = data?.versions || [];

    if (versions.length === 0) {
      container.innerHTML = '<p style="font-size:13px;color:var(--muted);">No hay versiones guardadas todavia.</p>';
      return;
    }

    let html = '';
    versions.forEach(v => {
      const date = new Date(v.created_at).toLocaleString('es-ES');
      html += `<div class="saved-version-card">
        <div class="saved-version-title">${v.label || 'Sin nombre'}</div>
        <div class="saved-version-meta">Guardada: ${date}</div>
        <button class="btn-secondary open-version-btn" data-version-id="${v.id}" type="button">Abrir version</button>
      </div>`;
    });
    container.innerHTML = html;

    // Bind open version buttons
    document.querySelectorAll('.open-version-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.target.dataset.versionId);
        if (confirm('Quieres restaurar esta version? Los cambios no guardados se perderan.')) {
          const versionData = await fetchVersion(id);
          if (versionData?.projectData) {
            appState.projectData = versionData.projectData;
            markDirty();
            renderAll();
          }
        }
      });
    });
  });
}

// Setup the save project button
function setupSaveButton() {
  const btn = document.getElementById('downloadJsonBtn');
  if (!btn) return;

  // Change button text from "Guardar proyecto" to show it saves to server
  btn.textContent = 'Guardar proyecto';

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    // First save current state
    await saveCurrentProject();

    // Then ask for version label
    const label = prompt('Nombre para esta version (dejar vacio para auto-generar):');
    if (label !== null) {
      const result = await createVersion(label || `Version ${new Date().toLocaleString('es-ES')}`);
      if (result?.success) {
        alert('Version guardada correctamente');
        renderVersions(); // Refresh the list
      } else {
        alert('Error al guardar la version');
      }
    }

    btn.disabled = false;
    btn.textContent = 'Guardar proyecto';
  });
}

// Call setupSaveButton after DOM load (will be called from app.js init)
```

Also update `app.js` initApp function to call `setupSaveButton()` after the initial render.

Commit: "024: Implement versions.js with save/restore"
