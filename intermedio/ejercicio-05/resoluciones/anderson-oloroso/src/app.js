import express from 'express';
import teamRoutes from './routes/team.routes.js';

const app = express();

app.use(express.json());
app.use(teamRoutes);

export default app;
