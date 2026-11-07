const express = require('express');
const misionesRoutes = require('./routes/quests.routes');
const errorHandler = require('./middlewares/error.handler');

const app = express();

app.use(express.json());

app.use(misionesRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'testing de rutas'
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use(errorHandler);

// IMPORTANTE: sin app.listen aqui. La app se exporta para que los tests
// la levanten en un puerto efimero (listen(0)) y puedan apuntar fetch a ella.
module.exports = app;
