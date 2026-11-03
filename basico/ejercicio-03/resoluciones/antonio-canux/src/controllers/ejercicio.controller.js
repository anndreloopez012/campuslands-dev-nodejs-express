// Importamos solo lo que necesitamos mediante desestructuración (CommonJS)
const { ejecutarEjercicio } = require('../services/ejercicio.service');

const getEjercicio03 = (req, res) => {
    try {
        const data = ejecutarEjercicio();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error en la arena de batalla (Servidor):", error);
        res.status(500).json({
            ok: false,
            message: "Se ha perdido la conexión con el servidor del torneo."
        });
    }
};

module.exports = {
    getEjercicio03
};