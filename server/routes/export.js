const express = require('express');
const router = express.Router();
const db = require('../db/db');

const SECTION_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6', '#ef4444'];

// GET /api/project/export/html - printable HTML
router.get('/html', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC LIMIT 1').get();
    if (!row) return res.status(404).send('<p>No project found</p>');

    const data = JSON.parse(row.current_json);
    const meta = data.projectMeta || {};
    const form = data.form || {};
    const sections = data.sections || [];

    let sectionsHtml = '';
    sections.forEach((section, si) => {
      const color = SECTION_COLORS[(si + 1) % SECTION_COLORS.length];
      let questionsHtml = '';

      (section.questions || []).forEach(q => {
        const criteria = q.miniPoints || [];
        let totalScore = 0;
        let totalMax = 0;
        let criteriaHtml = '';

        criteria.forEach(mp => {
          const score = parseFloat(mp.score) || 0;
          const max = parseFloat(mp.maxScore) || 1;
          totalScore += score;
          totalMax += max;
          criteriaHtml += `
            <div style="border:1px solid #e2e8f0;border-radius:6px;padding:12px;margin:8px 0;background:#fafafa;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <strong style="font-size:13px;">${mp.title || 'Criterio'}</strong>
                <span style="background:${color};color:white;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:600;">${score} / ${max}</span>
              </div>
              ${mp.meaning ? `<p style="font-size:12px;color:#475569;margin:3px 0;"><b>Significado:</b> ${mp.meaning}</p>` : ''}
              ${mp.rules ? `<p style="font-size:12px;color:#475569;margin:3px 0;"><b>Reglas:</b> ${mp.rules}</p>` : ''}
              ${mp.mandatory ? '<span style="font-size:11px;color:#dc2626;">Obligatorio</span>' : ''}
            </div>`;
        });

        const pct = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(0) : 0;
        questionsHtml += `
          <div style="border:1px solid #e2e8f0;border-radius:8px;margin:12px 0;overflow:hidden;">
            <div style="background:${color};color:white;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <span style="font-size:12px;opacity:0.8;">${q.code}</span>
                <strong style="display:block;font-size:14px;">${q.title}</strong>
              </div>
              <div style="text-align:right;">
                <div style="font-size:20px;font-weight:700;">${totalScore.toFixed(1)} / ${totalMax.toFixed(1)}</div>
                <div style="font-size:12px;opacity:0.8;">${pct}%</div>
              </div>
            </div>
            <div style="padding:12px 16px;">
              ${q.prompt ? `<p style="font-size:13px;color:#475569;margin:0 0 12px;">${q.prompt}</p>` : ''}
              ${criteriaHtml}
            </div>
          </div>`;
      });

      sectionsHtml += `
        <div style="margin:24px 0;">
          <div style="background:${color};color:white;padding:12px 20px;border-radius:8px;margin-bottom:16px;">
            <h2 style="margin:0;font-size:16px;">${section.title}</h2>
          </div>
          ${questionsHtml}
        </div>`;
    });

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>EACEA Evaluator - ${meta.projectName || 'Proyecto'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; padding: 32px; max-width: 900px; margin: 0 auto; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div style="border-bottom:3px solid #3b82f6;padding-bottom:20px;margin-bottom:28px;">
    <h1 style="font-size:22px;font-weight:700;color:#1e293b;">${meta.projectName || 'Sin nombre'}</h1>
    <div style="margin-top:8px;display:flex;gap:16px;font-size:13px;color:#64748b;">
      <span>Tipo: <strong>${meta.projectType || '-'}</strong></span>
      <span>Versión: <strong>${meta.workingVersion || '-'}</strong></span>
      <span>Formulario: <strong>${form.name || '-'} v${form.version || '-'}</strong></span>
    </div>
  </div>
  ${sectionsHtml}
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;">
    Generado por EACEA Evaluator · ${new Date().toLocaleString('es-ES')}
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    res.status(500).send(`<p>Error: ${e.message}</p>`);
  }
});

// GET /api/project/export/pdf - PDF via Puppeteer
router.get('/pdf', async (req, res) => {
  let browser;
  try {
    const puppeteer = require('puppeteer');
    const PORT = process.env.PORT || 3000;
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/api/project/export/html`, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' } });
    await browser.close();

    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="eacea_evaluator_${timestamp}.pdf"`);
    res.send(pdf);
  } catch (e) {
    if (browser) await browser.close().catch(() => {});
    if (e.code === 'MODULE_NOT_FOUND') {
      res.status(503).json({ error: 'PDF generation requires puppeteer. Run: npm install puppeteer' });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});

module.exports = router;
