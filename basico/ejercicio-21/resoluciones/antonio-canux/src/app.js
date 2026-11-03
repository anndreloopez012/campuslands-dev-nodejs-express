import express from 'express';
import routes from './routes/models.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/basico/ejercicio-21', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Servidor 3D en http://localhost:${PORT}/basico/ejercicio-21`));
}

export default app;
