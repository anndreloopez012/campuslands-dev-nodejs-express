
import express from 'express';
import playerRoutes from './routes/player.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ruta prefijada según lo requerido por el ejercicio
app.use('/basico/ejercicio-02', playerRoutes);

app.get('/', (req, res) => {
  res.send('API Backend - Shooter Competitivo (Ejercicio 02)');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo exitosamente en http://localhost:${PORT}`);
});