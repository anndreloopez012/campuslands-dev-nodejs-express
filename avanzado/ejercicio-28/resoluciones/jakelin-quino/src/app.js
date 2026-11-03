const express = require('express');

const app = express();
app.get('/matches', (_req, res) => res.json([{ id: 1, map: 'Island' }]));

module.exports = app;
