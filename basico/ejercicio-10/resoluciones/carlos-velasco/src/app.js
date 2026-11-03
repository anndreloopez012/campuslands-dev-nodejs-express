const express = require('express');
const pingpongRoutes = require('./routes/pingpong.routes');

const app = express();

const PORT = 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'funciones asincronas'
  });
});

app.use(pingpongRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de pingpong ejecutandose en http://localhost:${PORT}`);
});