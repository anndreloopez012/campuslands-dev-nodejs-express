import express from 'express';
import { getMatch, listMatches } from './controllers/matchesController.js';

const app = express();
app.get('/api/matches', listMatches);
app.get('/api/matches/:id', getMatch);
app.listen(process.env.PORT || 3000, () => console.log('API MOBA disponible en el puerto 3000'));
