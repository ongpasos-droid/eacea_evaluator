function renderAll() {
  renderSidebar();
  renderIntake();
  renderQuestionConfig();
  renderCriteria();
  renderScoring();
  renderVersions();
  updateToolbar();
}

function updateToolbar() {
  const titleEl = document.getElementById('questionTitle');
  const subtitleEl = document.getElementById('questionSubtitle');

  if (appState.activeSectionIndex === 0) {
    if (titleEl) titleEl.textContent = 'Módulo inicial';
    if (subtitleEl) subtitleEl.textContent = 'Define el nombre del proyecto, el tipo y gestiona versiones antes de trabajar las áreas de evaluación.';
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

async function initApp() {
  console.log('EACEA Evaluator: Loading...');

  const data = await fetchCurrentProject();
  if (!data) {
    console.error('Failed to load project data');
    document.getElementById('loadingOverlay')?.classList.add('hidden');
    return;
  }

  appState.projectData = data;
  appState.activeSectionIndex = 0;
  appState.activeQuestionIndex = 0;
  updateActiveColor();

  document.getElementById('loadingOverlay')?.classList.add('hidden');

  renderAll();
  setupSaveButton();

  window.addEventListener('beforeunload', (e) => {
    if (appState.hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  console.log('EACEA Evaluator: Ready');
}

document.addEventListener('DOMContentLoaded', initApp);
