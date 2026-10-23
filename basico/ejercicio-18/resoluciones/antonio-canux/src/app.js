import express from 'express';
import routes from './routes/saltos.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/basico/ejercicio-18', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor de Paracaidismo corriendo en puerto ${PORT}`);
  });
}

export default app;
