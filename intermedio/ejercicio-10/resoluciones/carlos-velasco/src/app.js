const express = require('express');
const playersRoutes = require('./routes/players.routes');

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(playersRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'ordenamiento de resultados'
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor de pingpong ejecutandose en http://localhost:${PORT}`);
});
