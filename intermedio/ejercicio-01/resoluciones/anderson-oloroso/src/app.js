import express from 'express';
import characterRoutes from './routes/character.routes.js';

const app = express();

app.use(express.json());

// Montaje de rutas
app.use(characterRoutes);

export default app;
