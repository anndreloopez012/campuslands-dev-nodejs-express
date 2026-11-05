import express from 'express';
import mainRouter from './routes/index.js';

const app = express();

app.use(express.json());
app.use(mainRouter);

export default app;
