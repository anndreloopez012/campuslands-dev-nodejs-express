const express = require('express');
const hypercarRoutes = require('./routes/hypercar.routes');
const { requestId, dataConId } = require('./middlewares/request.id');

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(requestId);

app.use(hypercarRoutes);

app.get('/health', (req, res) => {
  res.status(200).json(dataConId(res, {
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'middleware de request id'
  }));
});

app.use((req, res) => {
  res.status(404).json(dataConId(res, { ok: false, message: 'Ruta no encontrada' }));
});

app.listen(PORT, () => {
  console.log(`Servidor de hiperdeportivos ejecutandose en http://localhost:${PORT}`);
});
