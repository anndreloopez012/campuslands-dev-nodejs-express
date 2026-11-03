import express from 'express';
import ejercicioRoutes from './routes/ejercicio.routes.js';

const app = express();

app.use(express.json());
app.use('/basico/ejercicio-02', ejercicioRoutes);

export default app;
