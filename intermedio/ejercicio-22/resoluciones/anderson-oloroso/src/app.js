import express from 'express';
import uploadRoutes from './routes/upload.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(uploadRoutes);

app.listen(PORT, () => {
  console.log(`[BLUEPRINT UPLOAD SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-22`);
  console.log(`[UPLOAD] POST http://localhost:${PORT}/api/arq3d/blueprints/upload`);
});
