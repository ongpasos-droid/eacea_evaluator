function renderQuestionConfig() {
  const shell = document.getElementById('questionConfigShell');
  if (!shell) return;

  const isIntake = appState.activeSectionIndex === 0;
  shell.style.display = isIntake ? 'none' : 'block';
  if (isIntake) return;

  const question = getActiveQuestion();
  if (!question) return;

  setValue('questionCode', question.code || '');
  setValue('questionName', question.title || '');
  setValue('questionPrompt', question.prompt || '');
  setValue('questionMaxScore', question.maxScore || 0);
  setValue('questionThreshold', question.threshold || 0);
  setValue('scoreCaps', (question.scoreCaps || []).join('\n'));

  renderGeneralRules(question.generalRules || []);
  bindQuestionConfigEvents();
  updateThresholdWarning(question);
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function renderGeneralRules(rules) {
  const container = document.getElementById('generalRulesContainer');
  if (!container) return;

  let html = '';
  rules.forEach((rule, i) => {
    html += `<div class="field" style="margin-bottom:8px;">
      <div style="display:flex;gap:8px;align-items:flex-start;">
        <textarea class="form-control general-rule-input" data-rule-index="${i}" style="min-height:56px;">${rule}</textarea>
        <button class="btn btn-danger btn-small delete-rule-btn" data-rule-index="${i}" type="button">✕</button>
      </div>
    </div>`;
  });
  html += `<button class="btn btn-secondary btn-small add-rule-btn" style="margin-top:6px;" type="button">+ Añadir regla</button>`;
  container.innerHTML = html;
}

function bindQuestionConfigEvents() {
  ['questionCode', 'questionName', 'questionPrompt', 'questionMaxScore', 'questionThreshold'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.bound) {
      el.addEventListener('input', handleQuestionFieldChange);
      el.dataset.bound = 'true';
    }
  });

  const scoreCapsEl = document.getElementById('scoreCaps');
  if (scoreCapsEl && !scoreCapsEl.dataset.bound) {
    scoreCapsEl.addEventListener('input', () => {
      const question = getActiveQuestion();
      if (question) {
        question.scoreCaps = scoreCapsEl.value.split('\n').filter(s => s.trim());
        markDirty();
      }
    });
    scoreCapsEl.dataset.bound = 'true';
  }

  document.querySelectorAll('.general-rule-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.ruleIndex);
      const question = getActiveQuestion();
      if (question?.generalRules) {
        question.generalRules[idx] = e.target.value;
        markDirty();
      }
    });
  });

  document.querySelectorAll('.delete-rule-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.ruleIndex);
      const question = getActiveQuestion();
      if (question?.generalRules) {
        question.generalRules.splice(idx, 1);
        markDirty();
        renderQuestionConfig();
      }
    });
  });

  const addBtn = document.querySelector('.add-rule-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const question = getActiveQuestion();
      if (question) {
        if (!question.generalRules) question.generalRules = [];
        question.generalRules.push('');
        markDirty();
        renderQuestionConfig();
      }
    });
  }
}

function handleQuestionFieldChange(e) {
  const question = getActiveQuestion();
  if (!question) return;

  const fieldMap = {
    questionCode: 'code',
    questionName: 'title',
    questionPrompt: 'prompt',
    questionMaxScore: 'maxScore',
    questionThreshold: 'threshold'
  };

  const key = fieldMap[e.target.id];
  if (!key) return;

  let value = e.target.value;
  if (key === 'maxScore' || key === 'threshold') value = parseFloat(value) || 0;

  question[key] = value;
  markDirty();

  if (key === 'maxScore' || key === 'threshold') {
    updateThresholdWarning(question);
  }
}

function updateThresholdWarning(question) {
  const warningId = 'thresholdWarning';
  let warning = document.getElementById(warningId);
  const configGrid = document.querySelector('.config-grid');
  if (!configGrid) return;

  if (!warning) {
    warning = document.createElement('div');
    warning.id = warningId;
    warning.className = 'validation-warning';
    configGrid.appendChild(warning);
  }

  const maxScore = parseFloat(question.maxScore) || 0;
  const threshold = parseFloat(question.threshold) || 0;

  if (threshold > 0 && threshold >= maxScore) {
    warning.textContent = `Aviso: el umbral mínimo (${threshold}) debe ser menor que la puntuación máxima (${maxScore}).`;
    warning.style.display = 'block';
  } else {
    warning.style.display = 'none';
  }
}
