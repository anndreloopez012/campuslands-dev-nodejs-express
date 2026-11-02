import express from 'express';
import routes from './routes/rpg.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/basico/ejercicio-25', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Servidor RPG en http://localhost:${PORT}/basico/ejercicio-25`));
}

export default app;
