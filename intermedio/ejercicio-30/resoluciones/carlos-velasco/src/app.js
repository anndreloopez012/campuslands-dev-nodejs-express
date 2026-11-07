const express = require('express');
const tallerRoutes = require('./routes/taller.routes');
const errorHandler = require('./middlewares/error.handler');

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(tallerRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'proyecto integrador intermedio',
    modulos: ['motos', 'ordenes', 'repuestos']
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Taller de motos (integrador intermedio) en http://localhost:${PORT}`);
});
