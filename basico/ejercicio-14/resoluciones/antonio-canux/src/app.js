import express from 'express';
import routes from './routes/books.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/basico/ejercicio-14', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor de Libros corriendo en http://localhost:${PORT}`);
  });
}

export default app;
