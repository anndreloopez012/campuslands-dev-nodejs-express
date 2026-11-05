import express from 'express';
import fightersRoutes from './routes/fighters.routes.js';

const app = express();

app.use(express.json());
app.use(fightersRoutes);

export default app;
