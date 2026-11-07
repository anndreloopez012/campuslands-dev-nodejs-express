const express = require('express');
const mapsRoutes = require('./routes/maps.routes');
const matchesRoutes = require('./routes/matches.routes');

const app = express();

const PORT = 3000;

app.use(express.json());

app.use('/maps', mapsRoutes);
app.use('/matches', matchesRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'routers modulares'
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor de shooters competitivos ejecutandose en http://localhost:${PORT}`);
});
