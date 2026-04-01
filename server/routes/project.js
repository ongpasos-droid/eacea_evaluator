const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET /current - return active project JSON
router.get('/current', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC LIMIT 1').get();
    if (!row) return res.status(404).json({ error: 'No project found' });
    res.json(JSON.parse(row.current_json));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /current - save/update current project state
router.post('/current', (req, res) => {
  try {
    const { projectData } = req.body;
    if (!projectData || typeof projectData !== 'object') {
      return res.status(400).json({ error: 'projectData is required' });
    }
    const existing = db.prepare('SELECT id FROM projects ORDER BY updated_at DESC LIMIT 1').get();
    if (existing) {
      db.prepare(`
        UPDATE projects SET
          current_json = ?,
          name = ?,
          project_type = ?,
          working_version_name = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        JSON.stringify(projectData),
        projectData.projectMeta?.projectName || '',
        projectData.projectMeta?.projectType || '',
        projectData.projectMeta?.workingVersion || '',
        existing.id
      );
    } else {
      db.prepare(`
        INSERT INTO projects (name, project_type, working_version_name, form_name, form_version, current_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        projectData.projectMeta?.projectName || '',
        projectData.projectMeta?.projectType || '',
        projectData.projectMeta?.workingVersion || '',
        projectData.form?.name || '',
        projectData.form?.version || '',
        JSON.stringify(projectData)
      );
    }
    res.json({ success: true, updated_at: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /version - create named manual version snapshot
router.post('/version', (req, res) => {
  try {
    const { projectData } = req.body;
    if (!projectData) return res.status(400).json({ error: 'projectData is required' });
    const label = req.body.label || `Version ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
    const project = db.prepare('SELECT id FROM projects ORDER BY updated_at DESC LIMIT 1').get();
    if (!project) return res.status(404).json({ error: 'No project found' });
    const result = db.prepare(`
      INSERT INTO project_snapshots (project_id, snapshot_type, label, json_data)
      VALUES (?, 'manual_version', ?, ?)
    `).run(project.id, label, JSON.stringify(projectData));
    res.json({ success: true, id: result.lastInsertRowid, label });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /versions - list all versions + latest autosave
router.get('/versions', (req, res) => {
  try {
    const project = db.prepare('SELECT id FROM projects ORDER BY updated_at DESC LIMIT 1').get();
    if (!project) return res.json({ versions: [], latestAutosave: null });
    const versions = db.prepare(`
      SELECT id, label, snapshot_type, created_at FROM project_snapshots
      WHERE project_id = ? AND snapshot_type = 'manual_version'
      ORDER BY created_at DESC
    `).all(project.id);
    const latestAutosave = db.prepare(`
      SELECT id, label, snapshot_type, created_at FROM project_snapshots
      WHERE project_id = ? AND snapshot_type = 'autosave'
      ORDER BY created_at DESC LIMIT 1
    `).get(project.id) || null;
    res.json({ versions, latestAutosave });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /version/:id - return one snapshot
router.get('/version/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM project_snapshots WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Version not found' });
    res.json({
      id: row.id,
      label: row.label,
      snapshot_type: row.snapshot_type,
      created_at: row.created_at,
      projectData: JSON.parse(row.json_data)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /export/json - download current project as JSON file
router.get('/export/json', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC LIMIT 1').get();
    if (!row) return res.status(404).json({ error: 'No project found' });
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="eacea_project_export_${timestamp}.json"`);
    res.send(row.current_json);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /autosave - save autosave snapshot, keep only last 10
router.post('/autosave', (req, res) => {
  try {
    const { projectData } = req.body;
    if (!projectData) return res.status(400).json({ error: 'projectData is required' });
    const project = db.prepare('SELECT id FROM projects ORDER BY updated_at DESC LIMIT 1').get();
    if (!project) return res.status(404).json({ error: 'No project found' });
    db.prepare(`
      INSERT INTO project_snapshots (project_id, snapshot_type, label, json_data)
      VALUES (?, 'autosave', 'Autosave', ?)
    `).run(project.id, JSON.stringify(projectData));
    // Keep only last 10 autosaves
    const old = db.prepare(`
      SELECT id FROM project_snapshots
      WHERE project_id = ? AND snapshot_type = 'autosave'
      ORDER BY created_at DESC LIMIT -1 OFFSET 10
    `).all(project.id);
    if (old.length) {
      db.prepare(`DELETE FROM project_snapshots WHERE id IN (${old.map(() => '?').join(',')})`).run(...old.map(r => r.id));
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
