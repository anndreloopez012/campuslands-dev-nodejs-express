
const express = require('express');
const mobaRoutes = require('./routes/moba.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ruta solicitada por el ejercicio
app.use('/basico/ejercicio-03', mobaRoutes);

app.get('/', (req, res) => {
  res.send('API MOBA Esports - Ejercicio 03 CommonJS');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});