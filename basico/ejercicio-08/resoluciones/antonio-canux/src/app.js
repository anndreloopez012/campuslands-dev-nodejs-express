import express from 'express';
import hypercarsRoutes from './routes/hypercars.routes.js';
import { envs } from './config/envs.js';

const app = express();

app.use(express.json());

// Montar rutas
app.use('/basico', hypercarsRoutes);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ ok: false, message: 'Ruta de hiperdeportivos no encontrada' });
});

app.listen(envs.PORT, () => {
    console.log(`🏎️ Servidor de Hiperdeportivos corriendo en modo: ${envs.NODE_ENV}`);
    console.log(`🚀 Escuchando en el puerto: ${envs.PORT}`);
});