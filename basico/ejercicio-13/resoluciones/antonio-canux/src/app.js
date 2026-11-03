import express from 'express';
import routes from './routes/artifacts.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/basico/ejercicio-13', routes);

// Middleware centralizado de manejo de errores
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    ok: false,
    message: err.message || "Error interno del servidor espacial",
    status
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor de Ciencia Ficción corriendo en el puerto ${PORT}`);
  });
}

export default app;
