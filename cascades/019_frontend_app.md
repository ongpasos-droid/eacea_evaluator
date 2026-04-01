Create the main app bootstrap module at public/js/app.js.

This is the last script to load and orchestrates everything:

```javascript
// Main render function - called whenever state changes
function renderAll() {
  renderSidebar();
  renderIntake();
  renderQuestionConfig();
  renderCriteria();
  renderScoring();
  renderVersions();
  updateToolbar();
}

// Update the toolbar header based on active section/question
function updateToolbar() {
  const titleEl = document.getElementById('questionTitle');
  const subtitleEl = document.getElementById('questionSubtitle');

  if (appState.activeSectionIndex === 0) {
    if (titleEl) titleEl.textContent = 'Modulo inicial';
    if (subtitleEl) subtitleEl.textContent = 'Define el nombre del proyecto, el tipo de proyecto y gestiona versiones guardadas antes de trabajar las areas de evaluacion.';
  } else {
    const question = getActiveQuestion();
    const section = getActiveSection();
    if (question) {
      if (titleEl) titleEl.textContent = `${question.code} · ${question.title}`;
      if (subtitleEl) subtitleEl.textContent = question.prompt || '';
    } else if (section) {
      if (titleEl) titleEl.textContent = section.title;
      if (subtitleEl) subtitleEl.textContent = '';
    }
  }
}

// Initialize the application
async function initApp() {
  console.log('EACEA Evaluator: Loading...');

  // Fetch project data from API
  const data = await fetchCurrentProject();
  if (!data) {
    console.error('Failed to load project data');
    document.querySelector('.loading-overlay')?.classList.add('hidden');
    return;
  }

  // Set state
  appState.projectData = data;
  appState.activeSectionIndex = 0;
  appState.activeQuestionIndex = 0;
  updateActiveColor();

  // Hide loading overlay
  document.querySelector('.loading-overlay')?.classList.add('hidden');

  // Initial render
  renderAll();

  // Setup beforeunload warning
  window.addEventListener('beforeunload', (e) => {
    if (appState.hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  console.log('EACEA Evaluator: Ready');
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
```

Note: renderQuestionConfig, renderCriteria, renderScoring, and renderVersions don't exist yet. Create stub functions in their respective files so the app doesn't crash:

Create `public/js/ui/question-config.js` with: `function renderQuestionConfig() {}`
Create `public/js/ui/criteria.js` with: `function renderCriteria() {}`
Create `public/js/ui/scoring.js` with: `function renderScoring() {}`
Create `public/js/ui/versions.js` with: `function renderVersions() {}`

Commit: "019: Create app.js bootstrap and UI module stubs"
