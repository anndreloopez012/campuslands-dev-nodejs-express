const ejercicioService = require('../services/rpg.service');

const getEjercicioBasico = (req, res) => {
    try {
        // Llamamos a la lógica de negocio en el servicio
        const data = ejercicioService.ejecutarEjercicio();
        
        // Respondemos con código HTTP 200 (Éxito)
        res.status(200).json(data);
    } catch (error) {
        console.error("Error en el calabozo del código:", error);
        // Manejo de error con código HTTP 500
        res.status(500).json({
            ok: false,
            message: "Ha ocurrido un error interno en el servidor."
        });
    }
};

module.exports = {
    getEjercicioBasico
};