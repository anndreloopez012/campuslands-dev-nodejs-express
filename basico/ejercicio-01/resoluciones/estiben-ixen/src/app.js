const express = require(`express`);
const ejercicioRoutes = require(`./routes/routes`);


const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get(`/health`, (req, res) => {
    res.status(200).json({ok: true, message: 'Servidor funcionando correctamente'});
});

app.use(`/basico`, ejercicioRoutes);

app.use((req, res) => {
    res.status(404).json({ok: false, message: 'ruta no encontrada' });
});

app.use((err, req, res, next) => {
    console.error('Error inesperado:', err.message);
    res.status(500).json({ok: false, message: 'Error interno del servidor'});
});

app.listen(PORT, () => {
    console.log(`servidor RPG escuchando en http://localhost:${PORT}`);
});