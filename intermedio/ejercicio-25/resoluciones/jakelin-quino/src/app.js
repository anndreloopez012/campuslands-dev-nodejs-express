const express = require('express');

const app = express();
app.get('/heroes', (_req, res) => res.json([{ name: 'Ayla', level: 4 }]));

module.exports = app;
