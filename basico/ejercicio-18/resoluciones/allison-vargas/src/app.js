import express from 'express';
import ejercicioRoutes from './routes/ejercicio.routes.js';

const app = express();

// express.json() es obligatorio para que req.body funcione en las
// rutas POST: sin esto, req.body llegaria vacio o undefined.
app.use(express.json());
app.use('/basico/ejercicio-18', ejercicioRoutes);

export default app;
