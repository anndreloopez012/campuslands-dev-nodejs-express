const express = require('express');
const characterRoutes = require('./routes/characters');

const app = express();
app.use(express.json());
app.use('/characters', characterRoutes);

module.exports = app;
