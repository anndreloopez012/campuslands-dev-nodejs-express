const express = require('express');
const heroRoutes = require('./routes/heroRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint sugerido por el README del ejercicio
app.use('/basico/ejercicio-01', heroRoutes);

// Endpoint de la temática RPG
app.use('/api/rpg', heroRoutes);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[RPG SERVER] Servidor ejecutándose en http://localhost:${PORT}`);
        console.log(`[ENDPOINT] GET/POST http://localhost:${PORT}/basico/ejercicio-01`);
        console.log(`[ENDPOINT] GET/POST http://localhost:${PORT}/api/rpg`);
    });
}

module.exports = app;
