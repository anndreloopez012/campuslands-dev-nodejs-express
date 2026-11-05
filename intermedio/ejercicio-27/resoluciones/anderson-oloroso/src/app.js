import express from 'express';
import mobaDocsRoutes from './routes/mobaDocs.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(mobaDocsRoutes);

if (process.argv[1] && process.argv[1].endsWith('app.js')) {
  app.listen(PORT, () => {
    console.log(`[MOBA DOCS SERVER] Servidor escuchando en http://localhost:${PORT}`);
    console.log(`[DOCS] GET http://localhost:${PORT}/api/docs`);
    console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-27`);
  });
}

export default app;
