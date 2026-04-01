function renderVersions() {
  const container = document.getElementById('savedVersionsContainer');
  if (!container) return;
  if (appState.activeSectionIndex !== 0) return;

  fetchVersions().then(data => {
    const versions = data?.versions || [];
    if (versions.length === 0) {
      container.innerHTML = '<p style="font-size:13px;color:var(--muted);">No hay versiones guardadas todavía.</p>';
      return;
    }

    let html = '';
    versions.forEach(v => {
      const date = new Date(v.created_at).toLocaleString('es-ES');
      html += `<div class="version-item">
        <div class="version-item-label">${v.label || 'Sin nombre'}</div>
        <div class="version-item-date">${date}</div>
        <button class="btn btn-secondary btn-small open-version-btn" data-version-id="${v.id}" type="button" style="margin-top:6px;">Abrir versión</button>
      </div>`;
    });
    container.innerHTML = html;

    document.querySelectorAll('.open-version-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.target.dataset.versionId);
        if (confirm('¿Restaurar esta versión? Los cambios no guardados se perderán.')) {
          const v = await fetchVersion(id);
          if (v?.projectData) {
            appState.projectData = v.projectData;
            markDirty();
            renderAll();
          }
        }
      });
    });
  });
}

function setupSaveButton() {
  const btn = document.getElementById('downloadJsonBtn');
  if (!btn || btn.dataset.bound) return;
  btn.dataset.bound = 'true';

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    await saveCurrentProject();
    const label = prompt('Nombre para esta versión (dejar vacío para auto-generar):');
    if (label !== null) {
      const result = await createVersion(label || `Versión ${new Date().toLocaleString('es-ES')}`);
      if (result?.success) {
        alert(`Versión "${result.label}" guardada.`);
        renderVersions();
      } else {
        alert('Error al guardar la versión.');
      }
    }
    btn.disabled = false;
    btn.textContent = 'Guardar versión';
  });
}
