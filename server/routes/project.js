const express = require('express');
const router = express.Router();

router.get('/current', (req, res) => {
  res.json({ ok: true, message: 'GET /current - placeholder' });
});

router.post('/current', (req, res) => {
  res.json({ ok: true, message: 'POST /current - placeholder' });
});

router.post('/version', (req, res) => {
  res.json({ ok: true, message: 'POST /version - placeholder' });
});

router.get('/versions', (req, res) => {
  res.json({ ok: true, message: 'GET /versions - placeholder' });
});

router.get('/version/:id', (req, res) => {
  res.json({ ok: true, message: `GET /version/${req.params.id} - placeholder` });
});

router.get('/export/json', (req, res) => {
  res.json({ ok: true, message: 'GET /export/json - placeholder' });
});

module.exports = router;
