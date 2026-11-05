import express from 'express';
import brRoutes from './routes/battleroyale.routes.js';

const app = express();

app.use(express.json());
app.use(brRoutes);

export default app;
