const express = require('express');
const tracksRoutes = require('./routes/tracks.routes');

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(tracksRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'busqueda textual'
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor de musica ejecutandose en http://localhost:${PORT}`);
});
