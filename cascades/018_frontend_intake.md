Create the intake module at public/js/ui/intake.js.

This module renders the intake form (module 0) and binds input changes to state.

```javascript
function renderIntake() {
  const card = document.getElementById('intakeCard');
  if (!card || !appState.projectData) return;

  const meta = appState.projectData.projectMeta || {};
  const isActive = appState.activeSectionIndex === 0;

  // Show/hide intake card based on active section
  card.style.display = isActive ? 'block' : 'none';

  if (!isActive) return;

  // Set input values
  const nameInput = document.getElementById('projectName');
  const typeSelect = document.getElementById('projectType');
  const versionInput = document.getElementById('projectVersion');

  if (nameInput) nameInput.value = meta.projectName || '';
  if (typeSelect) typeSelect.value = meta.projectType || '';
  if (versionInput) versionInput.value = meta.workingVersion || '';

  bindIntakeEvents();
}

function bindIntakeEvents() {
  const nameInput = document.getElementById('projectName');
  const typeSelect = document.getElementById('projectType');
  const versionInput = document.getElementById('projectVersion');

  // Remove old listeners by cloning
  [nameInput, typeSelect, versionInput].forEach(el => {
    if (el && !el.dataset.bound) {
      el.addEventListener('input', handleIntakeChange);
      el.addEventListener('change', handleIntakeChange);
      el.dataset.bound = 'true';
    }
  });
}

function handleIntakeChange(e) {
  const id = e.target.id;
  const value = e.target.value;

  switch(id) {
    case 'projectName':
      updateProjectMeta('projectName', value);
      break;
    case 'projectType':
      updateProjectMeta('projectType', value);
      break;
    case 'projectVersion':
      updateProjectMeta('workingVersion', value);
      break;
  }
}
```

Also update the form chip in the sidebar header to show the current form name:
- Update `currentFormChip` element with `appState.projectData.form.name + ' v' + appState.projectData.form.version`

Commit: "018: Create intake.js with form rendering and binding"
