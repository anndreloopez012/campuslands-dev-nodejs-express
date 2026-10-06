import express from 'express';
import routes from './routes/teams.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/basico/ejercicio-29', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Servidor Fútbol en http://localhost:${PORT}/basico/ejercicio-29`));
}

export default app;
