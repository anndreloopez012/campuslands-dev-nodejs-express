import express from 'express';
import routes from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.set('query parser', 'simple');
app.disable('x-powered-by');
app.use(express.json());
app.use('/intermedio/ejercicio-15', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
