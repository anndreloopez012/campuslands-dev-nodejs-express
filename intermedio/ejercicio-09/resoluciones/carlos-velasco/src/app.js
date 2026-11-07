const express = require('express');
const fightersRoutes = require('./routes/fighters.routes');

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(fightersRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'paginacion y filtros'
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor de kickboxing ejecutandose en http://localhost:${PORT}`);
});
