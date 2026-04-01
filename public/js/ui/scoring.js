function renderScoring() {
  const panel = document.getElementById('scoringPanel');
  const totalEl = document.getElementById('totalScore');
  const percentEl = document.getElementById('totalPercent');
  if (!panel) return;

  const isIntake = appState.activeSectionIndex === 0;
  if (isIntake) {
    panel.innerHTML = '<p style="padding:16px;font-size:13px;color:var(--muted);">Selecciona una pregunta para ver el scoring.</p>';
    if (totalEl) totalEl.textContent = '- / -';
    if (percentEl) percentEl.textContent = '-';
    return;
  }

  const question = getActiveQuestion();
  if (!question) { panel.innerHTML = ''; return; }

  const criteria = question.miniPoints || [];
  let html = '';
  let totalScore = 0;
  let totalMaxScore = 0;

  criteria.forEach((mp, i) => {
    const score = parseFloat(mp.score) || 0;
    const maxScore = parseFloat(mp.maxScore) || 1;
    totalScore += score;
    totalMaxScore += maxScore;

    html += `<div class="score-row">
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${mp.title || 'Criterio ' + (i + 1)}</div>
        <div style="font-size:11px;color:var(--muted);">Máx: ${maxScore}${mp.mandatory ? ' · Oblig.' : ''}</div>
      </div>
      <input type="number" class="score-input form-control" data-ci="${i}" value="${score}" min="0" max="${maxScore}" step="0.5" style="width:56px;text-align:center;padding:4px 6px;">
    </div>`;
  });

  panel.innerHTML = html;

  const pct = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(0) : 0;
  if (totalEl) totalEl.textContent = `${totalScore.toFixed(1)} / ${totalMaxScore.toFixed(1)}`;
  if (percentEl) percentEl.textContent = `${pct}%`;

  document.querySelectorAll('.score-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const ci = parseInt(e.target.dataset.ci);
      const q = getActiveQuestion();
      if (q?.miniPoints?.[ci]) {
        const maxScore = parseFloat(q.miniPoints[ci].maxScore) || 1;
        let value = parseFloat(e.target.value) || 0;
        value = Math.max(0, Math.min(value, maxScore));
        if (parseFloat(e.target.value) !== value) e.target.value = value;
        q.miniPoints[ci].score = value;
        markDirty();
        recalculateTotals();
        const badge = document.querySelector(`.criterion-item[data-criterion-index="${ci}"] .criterion-badge`);
        if (badge) badge.textContent = `${value} / ${maxScore}`;
      }
    });
  });
}

function recalculateTotals() {
  const question = getActiveQuestion();
  if (!question) return;
  let totalScore = 0;
  let totalMaxScore = 0;
  (question.miniPoints || []).forEach(mp => {
    totalScore += parseFloat(mp.score) || 0;
    totalMaxScore += parseFloat(mp.maxScore) || 0;
  });
  const totalEl = document.getElementById('totalScore');
  const percentEl = document.getElementById('totalPercent');
  if (totalEl) totalEl.textContent = `${totalScore.toFixed(1)} / ${totalMaxScore.toFixed(1)}`;
  const pct = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(0) : 0;
  if (percentEl) percentEl.textContent = `${pct}%`;
}
