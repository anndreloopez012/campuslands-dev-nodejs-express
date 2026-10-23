import express from 'express';
import { requestId } from './middleware/requestId.js';

const app = express();
app.use(requestId);
app.get('/api/cars', (request, response) => response.json({ requestId: request.id, data: [{ id: 1, model: 'Vector X' }] }));
app.listen(process.env.PORT || 3000, () => console.log('API de hiperdeportivos disponible en el puerto 3000'));
