const express = require('express');
const indexRoutes = require('./routes/index.routes');
const errorHandler = require('./middlewares/error.handler');

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(indexRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'documentacion de endpoints',
    donde_documentarse: ['/docs', '/openapi.json']
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor de MOBA esports ejecutandose en http://localhost:${PORT}`);
});
