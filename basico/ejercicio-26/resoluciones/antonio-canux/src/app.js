import express from 'express';
import routes from './routes/matches.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/basico/ejercicio-26', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Servidor Shooter en http://localhost:${PORT}/basico/ejercicio-26`));
}

export default app;
