const express = require('express');
const scifiRoutes = require('./routes/scifi.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

const PORT = 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'manejo de errores'
  });
});

app.use(scifiRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada'
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor de ciencia ficcion ejecutandose en http://localhost:${PORT}`);
});