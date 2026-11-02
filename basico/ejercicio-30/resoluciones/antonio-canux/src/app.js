import express from 'express';
import routes from './routes/motorcycles.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/basico/ejercicio-30', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Servidor Integrador en http://localhost:${PORT}/basico/ejercicio-30`));
}

export default app;
