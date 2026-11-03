import express from 'express';
import motorcyclesRouter from './routes/motorcycles.js';

const app = express();
app.use(express.json());
app.use('/api/motorcycles', motorcyclesRouter);
app.use((request, response) => response.status(404).json({ error: `Ruta no encontrada: ${request.method} ${request.path}` }));
app.use((error, _request, response, _next) => response.status(error.status || 500).json({ error: error.message || 'Error interno.' }));
export default app;
