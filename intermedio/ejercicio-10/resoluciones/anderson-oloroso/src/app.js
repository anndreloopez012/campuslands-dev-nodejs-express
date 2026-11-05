import express from 'express';
import pingpongRoutes from './routes/pingpong.routes.js';

const app = express();

app.use(express.json());
app.use(pingpongRoutes);

export default app;
