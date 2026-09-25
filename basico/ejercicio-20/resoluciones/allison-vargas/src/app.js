// Aqui esta el foco del ejercicio: el ORDEN de app.use() importa.
// Un middleware solo afecta a las rutas que se registran DESPUES de el.

import express from 'express';
import ejercicioRoutes from './routes/ejercicio.routes.js';
import { registrarPeticion } from './middlewares/registrarPeticion.js';
import { crearDibujoSinMiddleware } from './controllers/ejercicio.controller.js';

const app = express();

// Middleware casero: se aplica a TODAS las peticiones, sin importar
// la ruta, porque se registra sin un "path" especifico.
app.use(registrarPeticion);

// Ruta de demostracion: se registra ANTES de app.use(express.json()),
// asi que req.body llegara undefined aunque el cliente mande JSON valido.
app.post('/basico/ejercicio-20/sin-json/dibujos', crearDibujoSinMiddleware);

// A partir de aqui SI se aplica express.json(): parsea el body JSON de
// la peticion y lo deja disponible como objeto en req.body.
app.use(express.json());
app.use('/basico/ejercicio-20', ejercicioRoutes);

export default app;
