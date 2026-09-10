const ejercicioService = require('../services/ejercicio.service');

const getEjercicio02 = (req, res) => {
    try {
        const data = ejercicioService.ejecutarEjercicio();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error crítico en el servidor de juego:", error);
        res.status(500).json({
            ok: false,
            message: "Fallo de conexión con los servidores de emparejamiento."
        });
    }
};

module.exports = {
    getEjercicio02
};