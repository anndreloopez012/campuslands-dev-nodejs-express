import express from 'express';
import { validateMotorcycle } from './middleware/validateMotorcycle.js';

const app = express();
app.use(express.json());
app.post('/api/motorcycles', validateMotorcycle, (request, response) => response.status(201).json({ data: request.motorcycle }));
app.listen(process.env.PORT || 3000, () => console.log('API de motos disponible en el puerto 3000'));
