import express from 'express';
import routes from './routes/welds.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/basico/ejercicio-23', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Servidor Soldadura en http://localhost:${PORT}/basico/ejercicio-23`));
}

export default app;
