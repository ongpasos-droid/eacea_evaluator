Create the frontend state management module at public/js/state.js.

This module manages all application state. Create it with:

```javascript
// State container
const appState = {
  projectData: null,
  activeSectionIndex: 0,
  activeQuestionIndex: 0,
  expandedSectionIndex: 0,
  hasUnsavedChanges: false,
  autosaveTimer: null,
  lastSavedAt: null
};

// Section colors mapping
const SECTION_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6', '#ef4444'];

// Get current active color
function getActiveColor() {
  return SECTION_COLORS[appState.activeSectionIndex] || SECTION_COLORS[0];
}

// Update the CSS --active-color variable
function updateActiveColor() {
  document.documentElement.style.setProperty('--active-color', getActiveColor());
}

// Get the active section object
function getActiveSection() {
  if (appState.activeSectionIndex === 0) return null; // Intake has no section
  const sectionIdx = appState.activeSectionIndex - 1;
  return appState.projectData?.sections?.[sectionIdx] || null;
}

// Get the active question object
function getActiveQuestion() {
  const section = getActiveSection();
  if (!section) return null;
  return section.questions?.[appState.activeQuestionIndex] || null;
}

// Mark state as dirty (has unsaved changes)
function markDirty() {
  appState.hasUnsavedChanges = true;
  scheduleAutosave();
}

// Mark state as clean
function markClean() {
  appState.hasUnsavedChanges = false;
  appState.lastSavedAt = new Date();
  clearAutosaveTimer();
}

// Autosave scheduling
function scheduleAutosave() {
  clearAutosaveTimer();
  appState.autosaveTimer = setTimeout(() => {
    if (appState.hasUnsavedChanges) {
      saveCurrentProject();
    }
  }, 25000); // 25 seconds of inactivity
}

function clearAutosaveTimer() {
  if (appState.autosaveTimer) {
    clearTimeout(appState.autosaveTimer);
    appState.autosaveTimer = null;
  }
}

// Update a field in projectMeta
function updateProjectMeta(key, value) {
  if (appState.projectData?.projectMeta) {
    appState.projectData.projectMeta[key] = value;
    markDirty();
  }
}

// Update a field in the active question
function updateActiveQuestionField(key, value) {
  const question = getActiveQuestion();
  if (question) {
    question[key] = value;
    markDirty();
  }
}

// Update a criterion (miniPoint) field
function updateCriterionField(criterionIndex, key, value) {
  const question = getActiveQuestion();
  if (question?.miniPoints?.[criterionIndex]) {
    question.miniPoints[criterionIndex][key] = value;
    markDirty();
  }
}
```

Note: `saveCurrentProject` will be defined in api.js. The function reference is fine because it will be defined by the time it's called.

Commit: "015: Create state.js with app state management"
