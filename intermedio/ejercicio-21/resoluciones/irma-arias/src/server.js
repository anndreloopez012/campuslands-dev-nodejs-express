import express from 'express';
import { rateLimit } from './middleware/rateLimit.js';

const app = express();
app.get('/api/assets', rateLimit, (_request, response) => response.json({ data: [{ id: 1, name: 'Escena de prueba' }] }));
app.listen(process.env.PORT || 3000, () => console.log('API de animación disponible en el puerto 3000'));
