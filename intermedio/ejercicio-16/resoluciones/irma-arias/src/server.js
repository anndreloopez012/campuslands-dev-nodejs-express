import express from 'express';
import { requireToken } from './middleware/requireToken.js';

const app = express();
app.get('/api/products', requireToken, (_request, response) => response.json({ data: [{ id: 1, name: 'Sneaker urbano' }] }));
app.listen(process.env.PORT || 3000, () => console.log('API de tienda disponible en el puerto 3000'));
