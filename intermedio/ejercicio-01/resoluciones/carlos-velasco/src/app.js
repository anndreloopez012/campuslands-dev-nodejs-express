const express = require('express');
const heroesRoutes = require('./routes/heroes.routes');

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(heroesRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'arquitectura por capas'
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor de RPG ejecutandose en http://localhost:${PORT}`);
});
