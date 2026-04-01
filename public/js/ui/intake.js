function renderIntake() {
  const card = document.getElementById('intakeCard');
  const shell = document.getElementById('questionConfigShell');
  if (!card || !appState.projectData) return;

  const isActive = appState.activeSectionIndex === 0;
  card.style.display = isActive ? 'block' : 'none';
  if (shell) shell.style.display = isActive ? 'none' : 'block';

  if (!isActive) return;

  const meta = appState.projectData.projectMeta || {};
  const nameInput = document.getElementById('projectName');
  const typeSelect = document.getElementById('projectType');
  const versionInput = document.getElementById('projectVersion');
  const formChip = document.getElementById('currentFormChip');

  if (nameInput) nameInput.value = meta.projectName || '';
  if (typeSelect) typeSelect.value = meta.projectType || '';
  if (versionInput) versionInput.value = meta.workingVersion || '';
  if (formChip) {
    const f = appState.projectData.form || {};
    formChip.textContent = f.name ? `${f.name} v${f.version}` : '';
  }

  bindIntakeEvents();
}

function bindIntakeEvents() {
  ['projectName', 'projectType', 'projectVersion'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.bound) {
      el.addEventListener('input', handleIntakeChange);
      el.addEventListener('change', handleIntakeChange);
      el.dataset.bound = 'true';
    }
  });
}

function handleIntakeChange(e) {
  switch (e.target.id) {
    case 'projectName':    updateProjectMeta('projectName', e.target.value); break;
    case 'projectType':    updateProjectMeta('projectType', e.target.value); break;
    case 'projectVersion': updateProjectMeta('workingVersion', e.target.value); break;
  }
}
