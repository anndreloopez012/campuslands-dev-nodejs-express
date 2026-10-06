import express from 'express';
import routes from './routes/moba.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de logs simple
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use('/basico/ejercicio-27', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Servidor MOBA Esports en http://localhost:${PORT}/basico/ejercicio-27`));
}

export default app;
