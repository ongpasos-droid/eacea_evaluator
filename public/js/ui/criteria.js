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
    html += `<div class="criterion-item" data-criterion-index="${i}">
      <div class="criterion-header">
        <div class="criterion-title">${mp.title || 'Criterio sin título'}</div>
        <div class="criterion-badge">${mp.score || 0} / ${mp.maxScore || 1}</div>
      </div>

      <div class="criterion-fields">
        <div class="criterion-field" style="grid-column:1/-1">
          <label>Título del criterio</label>
          <input type="text" class="form-control criterion-f" data-ci="${i}" data-field="title" value="${escapeAttr(mp.title || '')}">
        </div>
        <div class="criterion-field">
          <label>Significado</label>
          <textarea class="form-control criterion-f" data-ci="${i}" data-field="meaning">${mp.meaning || ''}</textarea>
        </div>
        <div class="criterion-field">
          <label>Estructura</label>
          <textarea class="form-control criterion-f" data-ci="${i}" data-field="structure">${mp.structure || ''}</textarea>
        </div>
        <div class="criterion-field">
          <label>Relaciones</label>
          <textarea class="form-control criterion-f" data-ci="${i}" data-field="relations">${mp.relations || ''}</textarea>
        </div>
        <div class="criterion-field">
          <label>Reglas</label>
          <textarea class="form-control criterion-f" data-ci="${i}" data-field="rules">${mp.rules || ''}</textarea>
        </div>
        <div class="criterion-field">
          <label>Puntuación máx.</label>
          <input type="number" class="form-control criterion-f" data-ci="${i}" data-field="maxScore" value="${mp.maxScore || 1}" min="0" step="0.1">
        </div>
        <div class="criterion-field">
          <label>Obligatorio</label>
          <select class="form-control criterion-f" data-ci="${i}" data-field="mandatory">
            <option value="true" ${mp.mandatory ? 'selected' : ''}>Sí</option>
            <option value="false" ${!mp.mandatory ? 'selected' : ''}>No</option>
          </select>
        </div>
      </div>

      <div style="display:flex;gap:6px;margin-top:10px;">
        ${i > 0 ? `<button class="btn btn-secondary btn-small move-criterion-btn" data-ci="${i}" data-dir="up" type="button">↑</button>` : ''}
        ${i < criteria.length - 1 ? `<button class="btn btn-secondary btn-small move-criterion-btn" data-ci="${i}" data-dir="down" type="button">↓</button>` : ''}
        <button class="btn btn-danger btn-small delete-criterion-btn" data-ci="${i}" type="button">Eliminar</button>
      </div>
    </div>`;
  });

  html += `<div style="padding:12px 16px;">
    <button class="btn btn-secondary add-criterion-btn" type="button">+ Añadir criterio</button>
  </div>`;
  container.innerHTML = html;

  bindCriteriaEvents();
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function bindCriteriaEvents() {
  document.querySelectorAll('.criterion-f').forEach(el => {
    el.addEventListener('input', (e) => {
      const ci = parseInt(e.target.dataset.ci);
      const field = e.target.dataset.field;
      let value = e.target.value;
      if (field === 'maxScore') value = parseFloat(value) || 0;
      if (field === 'mandatory') value = value === 'true';
      updateCriterionField(ci, field, value);
      if (field === 'title') {
        const header = document.querySelector(`.criterion-item[data-criterion-index="${ci}"] .criterion-title`);
        if (header) header.textContent = value || 'Criterio sin título';
      }
    });
  });

  document.querySelectorAll('.delete-criterion-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ci = parseInt(e.target.dataset.ci);
      const question = getActiveQuestion();
      if (question?.miniPoints && confirm('¿Eliminar este criterio?')) {
        question.miniPoints.splice(ci, 1);
        markDirty();
        renderCriteria();
        renderScoring();
      }
    });
  });

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

  const addBtn = document.querySelector('.add-criterion-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const question = getActiveQuestion();
      if (question) {
        if (!question.miniPoints) question.miniPoints = [];
        question.miniPoints.push({ title: 'Nuevo criterio', maxScore: 1, mandatory: false, meaning: '', structure: '', relations: '', rules: '', score: 0 });
        markDirty();
        renderCriteria();
        renderScoring();
      }
    });
  }
}
