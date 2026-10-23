import express from 'express';
import routes from './routes/battleroyale.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/basico/ejercicio-28', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Servidor Battle Royale en http://localhost:${PORT}/basico/ejercicio-28`));
}

export default app;
