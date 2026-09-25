const express = require('express');
const ejercicioRoutes = require('./routes/ejercicio.routes');
const { mostrarEstadoDelMundo } = require('./services/mundo.service');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ruta de salud basica, util para verificar que el servidor esta vivo
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, status: 'up' });
});

// Ruta principal del ejercicio
app.use('/basico/ejercicio-01', ejercicioRoutes);

app.listen(PORT, () => {
  console.log('==================================');
  console.log(' El mundo RPG esta despertando...');
  console.log('==================================');

  mostrarEstadoDelMundo();

  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
