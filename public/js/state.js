const appState = {
  projectData: null,
  activeSectionIndex: 0,
  activeQuestionIndex: 0,
  expandedSectionIndex: 0,
  hasUnsavedChanges: false,
  autosaveTimer: null,
  lastSavedAt: null
};

const SECTION_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6', '#ef4444'];

function getActiveColor() {
  return SECTION_COLORS[appState.activeSectionIndex] || SECTION_COLORS[0];
}

function updateActiveColor() {
  document.documentElement.style.setProperty('--active-color', getActiveColor());
}

function getActiveSection() {
  if (appState.activeSectionIndex === 0) return null;
  const sectionIdx = appState.activeSectionIndex - 1;
  return appState.projectData?.sections?.[sectionIdx] || null;
}

function getActiveQuestion() {
  const section = getActiveSection();
  if (!section) return null;
  return section.questions?.[appState.activeQuestionIndex] || null;
}

function markDirty() {
  appState.hasUnsavedChanges = true;
  scheduleAutosave();
}

function markClean() {
  appState.hasUnsavedChanges = false;
  appState.lastSavedAt = new Date();
  clearAutosaveTimer();
}

function scheduleAutosave() {
  clearAutosaveTimer();
  appState.autosaveTimer = setTimeout(() => {
    if (appState.hasUnsavedChanges) {
      saveCurrentProject();
    }
  }, 25000);
}

function clearAutosaveTimer() {
  if (appState.autosaveTimer) {
    clearTimeout(appState.autosaveTimer);
    appState.autosaveTimer = null;
  }
}

function updateProjectMeta(key, value) {
  if (appState.projectData?.projectMeta) {
    appState.projectData.projectMeta[key] = value;
    markDirty();
  }
}

function updateActiveQuestionField(key, value) {
  const question = getActiveQuestion();
  if (question) {
    question[key] = value;
    markDirty();
  }
}

function updateCriterionField(criterionIndex, key, value) {
  const question = getActiveQuestion();
  if (question?.miniPoints?.[criterionIndex]) {
    question.miniPoints[criterionIndex][key] = value;
    markDirty();
  }
}
