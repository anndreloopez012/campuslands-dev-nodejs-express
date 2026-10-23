import express from 'express';
import routes from './routes/sneakers.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/basico/ejercicio-16', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor Express de Sneakers corriendo en puerto ${PORT}`);
  });
}

export default app;
