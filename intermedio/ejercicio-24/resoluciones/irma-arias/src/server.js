import express from 'express';
import { getMolarMass } from './services/chemistryService.js';

const app = express();
app.get('/api/chemistry/mass', (request, response) => {
  try {
    return response.json({ formula: request.query.formula, molarMass: getMolarMass(request.query.formula) });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});
app.listen(process.env.PORT || 3000, () => console.log('API química disponible en el puerto 3000'));
