

const express = require('express');
const rpgRoutes = require('./routes/rpg.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', rpgRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Bienvenido al Backend API de RPG - Ejercicio 01" });
});

app.listen(PORT, () => {
  console.log(`Servidor RPG corriendo con éxito en http://localhost:${PORT}`);
});