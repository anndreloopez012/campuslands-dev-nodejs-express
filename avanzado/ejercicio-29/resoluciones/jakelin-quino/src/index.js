const express = require('express');

const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'football-api' }));
app.get('/teams', (_req, res) => res.json([{ name: 'Campus FC' }]));
app.listen(Number(process.env.PORT) || 3000, () => console.log('Football API lista'));
