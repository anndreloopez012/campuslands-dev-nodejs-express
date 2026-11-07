const express = require('express');
const canvasRoutes = require('./routes/canvas.routes');
const { corsMiddleware } = require('./middlewares/cors.middleware');
const errorHandler = require('./middlewares/error.handler');

const app = express();

const PORT = 3000;

// Whitelist declarativa: origenes explicitamente permitidos
const CORS_OPTIONS = {
  allowOrigins: ['http://localhost:5173', 'https://estudio-arte.dev'],
  allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-Canvas-Token'],
  maxAge: 600
};

app.use(corsMiddleware(CORS_OPTIONS));
app.use(express.json());

app.use(canvasRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'CORS controlado',
    origenes_permitidos: CORS_OPTIONS.allowOrigins
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor de dibujo digital ejecutandose en http://localhost:${PORT}`);
});
