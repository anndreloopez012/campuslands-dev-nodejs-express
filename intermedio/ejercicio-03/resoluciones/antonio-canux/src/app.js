import express from 'express';
import heroRoutes from './routes/hero.routes.js';

const app = express();

app.use(express.json());

app.get('/intermedio/ejercicio-003', (req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'Controladores limpios'
    });
});

app.use('/api/heroes', heroRoutes);

app.use((req, res) => {
    res.status(404).json({
        ok: false,
        message: 'Ruta no encontrada'
    });
});

export default app;