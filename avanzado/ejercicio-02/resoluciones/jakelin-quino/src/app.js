const express = require('express');
const players = require('./routes/players');

const app = express();
app.use('/players', players);

module.exports = app;
