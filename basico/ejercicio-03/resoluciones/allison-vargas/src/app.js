const express = require('express');
const ejercicioRoutes = require('./routes/ejercicio.routes');

const app = express();

app.use(express.json());
app.use('/basico/ejercicio-03', ejercicioRoutes);

module.exports = app;
