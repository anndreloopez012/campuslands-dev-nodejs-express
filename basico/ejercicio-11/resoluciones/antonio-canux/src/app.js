import express from 'express';
import musicRoutes from './routes/music.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/basico', musicRoutes);

app.use((req, res) => {
    res.status(404).json({ ok: false, message: 'Ruta musical no encontrada' });
});

app.listen(PORT, () => {
    console.log(`🎵 Servidor de Música corriendo en: http://localhost:${PORT}`);
});