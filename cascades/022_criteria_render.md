Implement the criteria rendering module at public/js/ui/criteria.js.

Replace the stub with a full implementation. Read the prototype HTML to see how criteria (miniPoints) are displayed.

Each criterion shows:
- Title with score badge
- Expandable fields: meaning, structure, relations, rules
- maxScore input, mandatory checkbox
- Score input for evaluation

```javascript
function renderCriteria() {
  const shell = document.querySelector('.criteria-shell');
  const container = document.getElementById('miniPointsContainer');
  if (!shell || !container) return;

  const isIntake = appState.activeSectionIndex === 0;
  shell.style.display = isIntake ? 'none' : 'block';

  if (isIntake) return;

  const question = getActiveQuestion();
  if (!question) { container.innerHTML = ''; return; }

  const criteria = question.miniPoints || [];
  let html = '';

  criteria.forEach((mp, i) => {
    html += `<div class="mini-point" data-criterion-index="${i}">
      <div class="mini-head">
        <h4>${mp.title || 'Criterio sin titulo'}</h4>
        <span class="score-badge">${mp.score || 0} / ${mp.maxScore || 1}</span>
      </div>

      <div class="field">
        <label>Titulo del criterio</label>
        <input type="text" class="criterion-field" data-ci="${i}" data-field="title" value="${escapeAttr(mp.title || '')}" />
      </div>

      <div class="field">
        <label>Significado (meaning)</label>
        <textarea class="criterion-field" data-ci="${i}" data-field="meaning">${mp.meaning || ''}</textarea>
      </div>

      <div class="field">
        <label>Estructura (structure)</label>
        <textarea class="criterion-field" data-ci="${i}" data-field="structure">${mp.structure || ''}</textarea>
      </div>

      <div class="field">
        <label>Relaciones (relations)</label>
        <textarea class="criterion-field" data-ci="${i}" data-field="relations">${mp.relations || ''}</textarea>
      </div>

      <div class="field">
        <label>Reglas (rules)</label>
        <textarea class="criterion-field" data-ci="${i}" data-field="rules">${mp.rules || ''}</textarea>
      </div>

      <div class="inline-grid">
        <div class="field">
          <label>Puntuacion maxima</label>
          <input type="number" class="criterion-field" data-ci="${i}" data-field="maxScore" value="${mp.maxScore || 1}" min="0" step="0.1" />
        </div>
        <div class="field">
          <label>Obligatorio</label>
          <select class="criterion-field" data-ci="${i}" data-field="mandatory">
            <option value="true" ${mp.mandatory ? 'selected' : ''}>Si</option>
            <option value="false" ${!mp.mandatory ? 'selected' : ''}>No</option>
          </select>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="btn-secondary delete-criterion-btn" data-ci="${i}" type="button">Eliminar criterio</button>
        ${i > 0 ? `<button class="btn-secondary move-criterion-btn" data-ci="${i}" data-dir="up" type="button">↑</button>` : ''}
        ${i < criteria.length - 1 ? `<button class="btn-secondary move-criterion-btn" data-ci="${i}" data-dir="down" type="button">↓</button>` : ''}
      </div>
    </div>`;
  });

  html += `<button class="btn-primary add-criterion-btn" style="margin-top:14px;" type="button">+ Anadir criterio</button>`;
  container.innerHTML = html;

  bindCriteriaEvents();
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function bindCriteriaEvents() {
  // Field changes
  document.querySelectorAll('.criterion-field').forEach(el => {
    el.addEventListener('input', (e) => {
      const ci = parseInt(e.target.dataset.ci);
      const field = e.target.dataset.field;
      let value = e.target.value;

      if (field === 'maxScore') value = parseFloat(value) || 0;
      if (field === 'mandatory') value = value === 'true';

      updateCriterionField(ci, field, value);
    });
  });

  // Delete criterion
  document.querySelectorAll('.delete-criterion-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ci = parseInt(e.target.dataset.ci);
      const question = getActiveQuestion();
      if (question?.miniPoints && confirm('Eliminar este criterio?')) {
        question.miniPoints.splice(ci, 1);
        markDirty();
        renderCriteria();
        renderScoring();
      }
    });
  });

  // Move criterion
  document.querySelectorAll('.move-criterion-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ci = parseInt(e.target.dataset.ci);
      const dir = e.target.dataset.dir;
      const question = getActiveQuestion();
      if (!question?.miniPoints) return;

      const targetIdx = dir === 'up' ? ci - 1 : ci + 1;
      if (targetIdx < 0 || targetIdx >= question.miniPoints.length) return;

      [question.miniPoints[ci], question.miniPoints[targetIdx]] = [question.miniPoints[targetIdx], question.miniPoints[ci]];
      markDirty();
      renderCriteria();
      renderScoring();
    });
  });

  // Add criterion
  const addBtn = document.querySelector('.add-criterion-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const question = getActiveQuestion();
      if (question) {
        if (!question.miniPoints) question.miniPoints = [];
        question.miniPoints.push({
          title: 'Nuevo criterio',
          maxScore: 1,
          mandatory: false,
          meaning: '',
          structure: '',
          relations: '',
          rules: '',
          score: 0
        });
        markDirty();
        renderCriteria();
        renderScoring();
      }
    });
  }
}
```

Commit: "022: Implement criteria.js with full CRUD"
