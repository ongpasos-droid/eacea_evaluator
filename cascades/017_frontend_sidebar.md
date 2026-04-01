Create the sidebar navigation module at public/js/ui/sidebar.js.

Read the prototype HTML to understand the sidebar structure. The sidebar contains:
1. A summary grid with section chips (Intake, Relevance, Quality, Impact, Work Plan)
2. Expandable section blocks with question items inside

Create sidebar.js with:

```javascript
function renderSidebar() {
  const container = document.getElementById('sidebar');
  if (!container || !appState.projectData) return;

  const sections = appState.projectData.sections || [];
  let html = '';

  // Section chips summary
  html += '<div class="sidebar-summary">';
  // Intake chip (always first, index 0)
  html += `<div class="section-chip intake-chip ${appState.activeSectionIndex === 0 ? 'active' : ''}" data-section-index="0">
    <div class="section-chip-number">0</div>
    <div class="section-chip-name">Intake</div>
  </div>`;

  // Section chips
  sections.forEach((section, i) => {
    const sectionIndex = i + 1;
    const isActive = appState.activeSectionIndex === sectionIndex;
    const totalQuestions = section.questions?.length || 0;
    html += `<div class="section-chip ${isActive ? 'active' : ''}" data-section-index="${sectionIndex}" style="${isActive ? `border-color: ${SECTION_COLORS[sectionIndex]}; background: color-mix(in srgb, ${SECTION_COLORS[sectionIndex]} 14%, white);` : ''}">
      <div class="section-chip-number">${sectionIndex}</div>
      <div class="section-chip-name">${section.title.replace(/^\d+\.\s*/, '')}</div>
      <div class="section-chip-meta">${totalQuestions} pregunta${totalQuestions !== 1 ? 's' : ''}</div>
    </div>`;
  });
  html += '</div>';

  // Expandable section blocks with questions
  sections.forEach((section, i) => {
    const sectionIndex = i + 1;
    const isExpanded = appState.expandedSectionIndex === i;
    html += `<div class="section-block">
      <div class="section-title ${isExpanded ? 'active' : ''}" data-expand-index="${i}">
        <span>${section.title}</span>
        <span>${isExpanded ? '▾' : '▸'}</span>
      </div>
      <div class="question-list ${isExpanded ? 'open' : ''}">`;

    (section.questions || []).forEach((q, qi) => {
      const isActiveQ = appState.activeSectionIndex === sectionIndex && appState.activeQuestionIndex === qi;
      html += `<div class="question-item ${isActiveQ ? 'active' : ''}" data-section-index="${sectionIndex}" data-question-index="${qi}">
        <div class="question-code">${q.code}</div>
        <div class="question-name">${q.title}</div>
        <div class="meta-row">
          <span class="pill">Max: ${q.maxScore}</span>
          <span class="pill">Umbral: ${q.threshold}</span>
          <span class="pill">${q.miniPoints?.length || 0} criterios</span>
        </div>
      </div>`;
    });

    html += '</div></div>';
  });

  container.innerHTML = html;
  bindSidebarEvents();
}

function bindSidebarEvents() {
  // Section chip clicks
  document.querySelectorAll('.section-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const idx = parseInt(chip.dataset.sectionIndex);
      switchToSection(idx);
    });
  });

  // Section expand/collapse
  document.querySelectorAll('.section-title').forEach(title => {
    title.addEventListener('click', () => {
      const idx = parseInt(title.dataset.expandIndex);
      appState.expandedSectionIndex = (appState.expandedSectionIndex === idx) ? -1 : idx;
      renderSidebar();
    });
  });

  // Question item clicks
  document.querySelectorAll('.question-item').forEach(item => {
    item.addEventListener('click', () => {
      const sIdx = parseInt(item.dataset.sectionIndex);
      const qIdx = parseInt(item.dataset.questionIndex);
      switchToQuestion(sIdx, qIdx);
    });
  });
}

function switchToSection(sectionIndex) {
  if (appState.hasUnsavedChanges) saveCurrentProject();
  appState.activeSectionIndex = sectionIndex;
  appState.activeQuestionIndex = 0;
  if (sectionIndex > 0) {
    appState.expandedSectionIndex = sectionIndex - 1;
  }
  updateActiveColor();
  renderAll();
}

function switchToQuestion(sectionIndex, questionIndex) {
  if (appState.hasUnsavedChanges) saveCurrentProject();
  appState.activeSectionIndex = sectionIndex;
  appState.activeQuestionIndex = questionIndex;
  appState.expandedSectionIndex = sectionIndex - 1;
  updateActiveColor();
  renderAll();
}
```

Commit: "017: Create sidebar.js with navigation"
