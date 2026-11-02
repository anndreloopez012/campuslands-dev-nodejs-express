import express from 'express';
import moviesRoutes from './routes/movies.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Montar rutas en el prefijo solicitado por el trainer: /basico/ejercicio-12
app.use('/basico/ejercicio-12', moviesRoutes);

// Manejador para rutas 404
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada en la API de Películas de Miedo'
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);
  res.status(500).json({
    ok: false,
    message: 'Error interno en el servidor',
    error: err.message
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🎬 Servidor de Películas de Terror corriendo en: http://localhost:${PORT}/basico/ejercicio-12`);
  });
}

export default app;
