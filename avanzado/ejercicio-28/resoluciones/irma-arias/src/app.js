const express = require('express');
const app = express();
app.get('/matches', (req, res) => res.json({ matches: ['Zona final'] }));
module.exports = app;
