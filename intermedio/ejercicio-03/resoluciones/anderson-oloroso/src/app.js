import express from 'express';
import mobaRoutes from './routes/moba.routes.js';

const app = express();

app.use(express.json());
app.use(mobaRoutes);

export default app;
