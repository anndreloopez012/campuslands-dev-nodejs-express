import express from 'express';
import ejercicioRoutes from './routes/ejercicio.routes.js';
import { registrarPeticionHTTP } from './middlewares/logger.js';
import { rutaNoEncontrada, manejadorDeErrores } from './middlewares/errorHandler.js';

const app = express();

app.use(registrarPeticionHTTP);
app.use(express.json());
app.use('/basico/ejercicio-30', ejercicioRoutes);
app.use(rutaNoEncontrada);
app.use(manejadorDeErrores);

export default app;
