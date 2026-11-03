import express from 'express';
import routes from './routes/compounds.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/basico/ejercicio-24', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Servidor Fórmulas Químicas en http://localhost:${PORT}/basico/ejercicio-24`));
}

export default app;
