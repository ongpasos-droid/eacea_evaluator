Implement the scoring panel module at public/js/ui/scoring.js.

The scoring panel (right sidebar / inspector) shows:
1. A score input for each criterion of the active question
2. Live total calculation (sum of scores)
3. Percentage display
4. Visual sync with the active section color

```javascript
function renderScoring() {
  const panel = document.getElementById('scoringPanel');
  const totalEl = document.getElementById('totalScore');
  const percentEl = document.getElementById('totalPercent');
  if (!panel) return;

  const isIntake = appState.activeSectionIndex === 0;
  if (isIntake) {
    panel.innerHTML = '<p style="color:var(--muted);font-size:13px;">Selecciona una pregunta para ver el scoring.</p>';
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

    html += `<div class="score-line">
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:700;margin-bottom:2px;">${mp.title || 'Criterio ' + (i+1)}</div>
        <div style="font-size:11px;color:var(--muted);">Max: ${maxScore}${mp.mandatory ? ' · Obligatorio' : ''}</div>
      </div>
      <input type="number" class="score-input" data-ci="${i}" value="${score}" min="0" max="${maxScore}" step="0.1" />
    </div>`;
  });

  panel.innerHTML = html;

  // Update totals
  if (totalEl) totalEl.textContent = `${totalScore.toFixed(1)} / ${totalMaxScore.toFixed(1)}`;
  const percent = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(0) : 0;
  if (percentEl) percentEl.textContent = `${percent}%`;

  // Bind score input events
  document.querySelectorAll('.score-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const ci = parseInt(e.target.dataset.ci);
      const value = parseFloat(e.target.value) || 0;
      const question = getActiveQuestion();
      if (question?.miniPoints?.[ci]) {
        question.miniPoints[ci].score = value;
        markDirty();
        // Update totals without full re-render
        recalculateTotals();
        // Also update the score badge in criteria panel
        const badge = document.querySelector(`.mini-point[data-criterion-index="${ci}"] .score-badge`);
        if (badge) badge.textContent = `${value} / ${question.miniPoints[ci].maxScore || 1}`;
      }
    });
  });
}

function recalculateTotals() {
  const question = getActiveQuestion();
  if (!question) return;

  const criteria = question.miniPoints || [];
  let totalScore = 0;
  let totalMaxScore = 0;

  criteria.forEach(mp => {
    totalScore += parseFloat(mp.score) || 0;
    totalMaxScore += parseFloat(mp.maxScore) || 0;
  });

  const totalEl = document.getElementById('totalScore');
  const percentEl = document.getElementById('totalPercent');
  if (totalEl) totalEl.textContent = `${totalScore.toFixed(1)} / ${totalMaxScore.toFixed(1)}`;
  const percent = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(0) : 0;
  if (percentEl) percentEl.textContent = `${percent}%`;
}
```

Commit: "023: Implement scoring.js with live calculation"
