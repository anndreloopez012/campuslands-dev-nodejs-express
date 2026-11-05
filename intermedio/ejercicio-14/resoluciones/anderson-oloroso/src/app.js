import express from 'express';
import bookRoutes from './routes/books.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bookRoutes);

app.listen(PORT, () => {
  console.log(`[LIBRARY AUTH SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-14`);
  console.log(`[CATALOG] GET/POST http://localhost:${PORT}/api/books/catalog`);
});
