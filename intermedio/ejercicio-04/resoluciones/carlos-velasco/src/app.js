const express = require('express');
const { armasRouter, escuadrasRouter } = require('./routes/index.routes');
const errorHandler = require('./middlewares/error.handler');

const app = express();

const PORT = 3000;

app.use(express.json());

app.use('/armas', armasRouter);
app.use('/escuadras', escuadrasRouter);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'servicios reutilizables'
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor de battle royale ejecutandose en http://localhost:${PORT}`);
});
