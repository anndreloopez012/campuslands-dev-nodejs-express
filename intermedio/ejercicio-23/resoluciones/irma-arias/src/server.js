import express from 'express';
import { calculateWeldEstimate } from './services/weldService.js';

const app = express();
app.get('/api/weld-estimate', (request, response) => {
  try {
    const materialGrams = calculateWeldEstimate(Number(request.query.length), Number(request.query.thickness));
    return response.json({ materialGrams });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});
app.listen(process.env.PORT || 3000, () => console.log('API de soldadura disponible en el puerto 3000'));
