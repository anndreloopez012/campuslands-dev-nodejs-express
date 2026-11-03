const express = require('express');
const rutasEjercicio = require('./routes/rpg.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar JSON (buena práctica aunque hoy no enviemos un body)
app.use(express.json());

// Inyectamos las rutas
app.use('/', rutasEjercicio);

// Manejo de rutas inexistentes (404)
app.use((req, res) => {
    res.status(404).json({ ok: false, message: "Camino bloqueado. Ruta no encontrada." });
});

// Levantar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Taberna RPG de Node abierta en el puerto ${PORT}`);
    console.log(`🌍 Endpoint activo: http://localhost:${PORT}/basico/ejercicio-01`);
});