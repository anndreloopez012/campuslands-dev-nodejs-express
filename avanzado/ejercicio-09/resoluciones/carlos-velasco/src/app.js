const express = require('express');
const trainingRoutes = require('./routes/training.routes');

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(trainingRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'streams basicos'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de kickboxing ejecutandose en http://localhost:${PORT}`);
});