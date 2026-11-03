import express from 'express';
import teamsRouter from './routes/teams.js';
import mapsRouter from './routes/maps.js';

const app = express();
app.use(express.json());
app.use('/api/teams', teamsRouter);
app.use('/api/maps', mapsRouter);
app.listen(process.env.PORT || 3000, () => console.log('API shooter disponible en el puerto 3000'));
