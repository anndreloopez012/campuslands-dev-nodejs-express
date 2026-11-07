const express = require('express');
const uploadsRoutes = require('./routes/uploads.routes');
const errorHandler = require('./middlewares/error.handler');

const app = express();

const PORT = 3000;

// El cuerpo maximo de JSON tambien protege al servidor (simulacion de limite de subida)
app.use(express.json({ limit: '1mb' }));

app.use(uploadsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'subida simulada de archivos'
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor de modelos arquitectonicos ejecutandose en http://localhost:${PORT}`);
});
