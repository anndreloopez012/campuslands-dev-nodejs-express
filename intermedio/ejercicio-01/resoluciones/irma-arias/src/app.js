import express from 'express';
import heroesRouter from './routes/heroes.js';

const app = express();
app.use(express.json());
app.use('/api/heroes', heroesRouter);

export default app;
