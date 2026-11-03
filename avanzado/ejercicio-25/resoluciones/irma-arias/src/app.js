const express = require('express');
const app = express();
app.get('/health', (req, res) => res.json({ ok: true, game: 'RPG' }));
module.exports = app;
