import express from 'express';
import heroRoutes from './routes/routes.js';

const app = express();

app.use(express.json());
app.use('/api/v1/hero', heroRoutes);

export default app;