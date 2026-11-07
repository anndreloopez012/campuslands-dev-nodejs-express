const express = require('express');
const footballRoutes = require('./routes/football.routes');
const errorHandler = require('./middlewares/error.handler');

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(footballRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'refactor de API',
    version: '2.0 refactorizada (antes: monolito en src/legacy/app.legacy.js)'
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor de football refactorizado ejecutandose en http://localhost:${PORT}`);
});
