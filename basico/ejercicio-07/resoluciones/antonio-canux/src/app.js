import express from 'express';
import carsRoutes from './routes/cars.routes.js';

const app = express();

// Buscar si pasamos el argumento --port al ejecutar el servidor
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
// Si existe --port, tomamos el siguiente valor; si no, usamos 3000
const PORT = portIndex !== -1 ? args[portIndex + 1] : 3000;

app.use(express.json());

// Montar rutas
app.use('/basico', carsRoutes);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`🚗 Servidor de Autos de Lujo corriendo en http://localhost:${PORT}`);
    console.log(`💡 Tip: Puedes cambiar el puerto usando: node src/app.js --port 4000`);
});