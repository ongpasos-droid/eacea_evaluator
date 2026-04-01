function renderSidebar() {
  const container = document.getElementById('sidebar');
  if (!container || !appState.projectData) return;

  const sections = appState.projectData.sections || [];
  let html = '';

  html += '<div class="sidebar-summary">';
  html += `<div class="section-chip intake-chip ${appState.activeSectionIndex === 0 ? 'active' : ''}" data-section-index="0">
    <div class="section-chip-number">0</div>
    <div class="section-chip-name">Intake</div>
  </div>`;

  sections.forEach((section, i) => {
    const sectionIndex = i + 1;
    const isActive = appState.activeSectionIndex === sectionIndex;
    const color = SECTION_COLORS[sectionIndex] || SECTION_COLORS[0];
    const totalQuestions = section.questions?.length || 0;
    html += `<div class="section-chip ${isActive ? 'active' : ''}" data-section-index="${sectionIndex}" ${isActive ? `style="border-color:${color};background:color-mix(in srgb,${color} 14%,white);"` : ''}>
      <div class="section-chip-number">${sectionIndex}</div>
      <div class="section-chip-name">${section.title.replace(/^\d+\.\s*/, '')}</div>
      <div class="section-chip-meta">${totalQuestions} pregunta${totalQuestions !== 1 ? 's' : ''}</div>
    </div>`;
  });
  html += '</div>';

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
  document.querySelectorAll('.section-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      switchToSection(parseInt(chip.dataset.sectionIndex));
    });
  });

  document.querySelectorAll('.section-title').forEach(title => {
    title.addEventListener('click', () => {
      const idx = parseInt(title.dataset.expandIndex);
      appState.expandedSectionIndex = (appState.expandedSectionIndex === idx) ? -1 : idx;
      renderSidebar();
    });
  });

  document.querySelectorAll('.question-item').forEach(item => {
    item.addEventListener('click', () => {
      switchToQuestion(parseInt(item.dataset.sectionIndex), parseInt(item.dataset.questionIndex));
    });
  });
}

function switchToSection(sectionIndex) {
  if (appState.hasUnsavedChanges) saveCurrentProject();
  appState.activeSectionIndex = sectionIndex;
  appState.activeQuestionIndex = 0;
  if (sectionIndex > 0) appState.expandedSectionIndex = sectionIndex - 1;
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
