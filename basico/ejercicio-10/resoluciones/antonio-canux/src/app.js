import express from 'express';
import pingpongRoutes from './routes/pingpong.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/basico', pingpongRoutes);

app.use((req, res) => {
    res.status(404).json({ ok: false, message: 'Ruta de pingpong no encontrada' });
});

app.listen(PORT, () => {
    console.log(`🏓 Servidor de PingPong listo en: http://localhost:${PORT}`);
    console.log(`⏳ Listo para procesar partidos de forma asíncrona...`);
});