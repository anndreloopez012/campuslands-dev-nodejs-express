const express = require('express');
const teams = require('./routes/teams');

const app = express();
app.use(express.json());
app.use('/teams', teams);

module.exports = app;
