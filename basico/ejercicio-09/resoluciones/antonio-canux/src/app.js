import express from 'express';
import fightersRoutes from './routes/fighters.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware vital para poder leer JSON en el req.body
app.use(express.json());

app.use('/basico', fightersRoutes);

app.use((req, res) => {
    res.status(404).json({ ok: false, message: 'Ruta de kickboxing no encontrada' });
});

app.listen(PORT, () => {
    console.log(`🥊 Servidor de Kickboxing en: http://localhost:${PORT}`);
});