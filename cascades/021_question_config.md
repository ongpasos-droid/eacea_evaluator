Implement the question configuration module at public/js/ui/question-config.js.

Replace the stub with a full implementation. Read the prototype HTML to understand the exact UI structure.

The question config panel shows when a question is selected (activeSectionIndex > 0). It contains:
1. Question general data: code, title, prompt, maxScore, threshold
2. General rules list with add/delete capability
3. Score caps textarea

```javascript
function renderQuestionConfig() {
  const shell = document.querySelector('.question-config-shell');
  if (!shell) return;

  const isIntake = appState.activeSectionIndex === 0;
  shell.style.display = isIntake ? 'none' : 'block';

  if (isIntake) return;

  const question = getActiveQuestion();
  if (!question) return;

  // Populate question fields
  setValue('questionCode', question.code || '');
  setValue('questionName', question.title || '');
  setValue('questionPrompt', question.prompt || '');
  setValue('questionMaxScore', question.maxScore || 0);
  setValue('questionThreshold', question.threshold || 0);
  setValue('scoreCaps', (question.scoreCaps || []).join('\n'));

  // Render general rules
  renderGeneralRules(question.generalRules || []);

  // Bind events
  bindQuestionConfigEvents();
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
    html += `<div class="field" style="position:relative;">
      <label>Regla ${i + 1}</label>
      <div style="display:flex;gap:8px;align-items:start;">
        <textarea class="general-rule-input" data-rule-index="${i}" style="min-height:60px;">${rule}</textarea>
        <button class="btn-secondary delete-rule-btn" data-rule-index="${i}" style="padding:8px 10px;white-space:nowrap;" type="button">✕</button>
      </div>
    </div>`;
  });
  html += `<button class="btn-secondary add-rule-btn" style="margin-top:10px;" type="button">+ Anadir regla</button>`;
  container.innerHTML = html;
}

function bindQuestionConfigEvents() {
  // Question field inputs
  ['questionCode', 'questionName', 'questionPrompt', 'questionMaxScore', 'questionThreshold'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.bound) {
      el.addEventListener('input', handleQuestionFieldChange);
      el.dataset.bound = 'true';
    }
  });

  // Score caps
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

  // General rule inputs
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

  // Delete rule buttons
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

  // Add rule button
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
  if (key === 'maxScore' || key === 'threshold') {
    value = parseFloat(value) || 0;
  }

  question[key] = value;
  markDirty();
}
```

Commit: "021: Implement question-config.js with editing"
