const express = require('express');
const path = require('path');
const cors = require('cors');

require('./db/seed');
const projectRoutes = require('./routes/project');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/project', projectRoutes);
app.use('/api/project/export', exportRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`EACEA Evaluator running on port ${PORT}`);
});
