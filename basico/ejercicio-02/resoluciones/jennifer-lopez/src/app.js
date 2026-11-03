import express from 'express';
import matchRoutes from './routes/routes.js';

const app = express();

app.use(express.json());
app.use('/api/v1/match', matchRoutes);

export default app;