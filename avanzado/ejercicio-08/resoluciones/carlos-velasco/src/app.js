const express = require('express');
const hypercarRoutes = require('./routes/hypercar.routes');

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(hypercarRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'event emitter'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de hiperdeportivos ejecutandose en http://localhost:${PORT}`);
});