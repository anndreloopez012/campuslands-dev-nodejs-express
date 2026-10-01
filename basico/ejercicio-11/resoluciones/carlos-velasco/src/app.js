const express = require('express');
const musicRoutes = require('./routes/music.routes');

const app = express();

const PORT = 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'promesas basicas'
  });
});

app.use(musicRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de musica ejecutandose en http://localhost:${PORT}`);
});