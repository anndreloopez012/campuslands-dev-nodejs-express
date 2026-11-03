import express from 'express';
import { requireRole } from './middleware/requireRole.js';

const app = express();
app.get('/api/bookings', requireRole('admin'), (_request, response) => response.json({ data: [{ id: 1, destination: 'Cartagena' }] }));
app.listen(process.env.PORT || 3000, () => console.log('API de viajes disponible en el puerto 3000'));
