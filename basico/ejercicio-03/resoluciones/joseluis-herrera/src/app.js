const express = require('express');

const app = express();

const teamsRoutes = require('./routes/equipos.js');
app.use('/api', teamsRoutes);

module.exports = app;