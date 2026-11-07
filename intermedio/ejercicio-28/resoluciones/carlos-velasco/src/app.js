const express = require('express');
const galeriaRoutes = require('./routes/galeria.routes');
const { ejemplos } = require('./http/catalogo');
const errorHandler = require('./middlewares/error.handler');

const app = express();

const PORT = 3000;

app.use(express.json());

// Catalogo self-service: la coleccion completa de ejemplos HTTP
app.get('/ejemplos', (req, res) => {
  res.status(200).json({
    ok: true,
    serie: 'colección de ejemplos HTTP',
    dominio: 'battle royale',
    total: ejemplos.length,
    data: ejemplos
  });
});

app.use(galeriaRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'coleccion de ejemplos HTTP',
    consulta_catalogo: '/ejemplos'
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor battle royale (galeria HTTP) ejecutandose en http://localhost:${PORT}`);
});
