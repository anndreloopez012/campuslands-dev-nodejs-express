const express = require('express');
const rutasEjercicio = require('./routes/ejercicio.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', rutasEjercicio);

app.use((req, res) => {
    res.status(404).json({ ok: false, message: "Niebla de guerra. Ruta no encontrada." });
});

app.listen(PORT, () => {
    console.log(`🚀 API MOBA (CommonJS) levantada en puerto ${PORT}`);
    console.log(`🎮 Endpoint: http://localhost:${PORT}/basico/ejercicio-03`);
});