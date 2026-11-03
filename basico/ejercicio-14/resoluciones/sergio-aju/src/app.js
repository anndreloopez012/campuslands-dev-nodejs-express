import express from 'express';
import librosRoutes from './routes/libros.routes.js';

const app = express();

app.use(express.json());

app.use('/libros', librosRoutes);

export default app;