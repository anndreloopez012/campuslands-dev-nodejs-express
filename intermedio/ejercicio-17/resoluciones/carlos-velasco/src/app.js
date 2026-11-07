const express = require('express');
const travelRoutes = require('./routes/travel.routes');
const errorHandler = require('./middlewares/error.handler');

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(travelRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'roles y permisos'
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor de turismo ejecutandose en http://localhost:${PORT}`);
});
