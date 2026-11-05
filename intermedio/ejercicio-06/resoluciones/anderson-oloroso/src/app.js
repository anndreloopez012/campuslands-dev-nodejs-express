import express from 'express';
import mechanicRoutes from './routes/mechanic.routes.js';

const app = express();

app.use(express.json());
app.use(mechanicRoutes);

export default app;
