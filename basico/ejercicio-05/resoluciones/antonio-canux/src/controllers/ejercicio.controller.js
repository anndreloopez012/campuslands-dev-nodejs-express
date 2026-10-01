const { ejecutarEjercicio } = require('../services/ejercicio.service');

const getEjercicio05 = async (req, res) => {
    try {
        // Al leer archivos, debemos esperar (await) a que el proceso termine
        const data = await ejecutarEjercicio();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error en el terreno de juego (Servidor):", error);
        res.status(500).json({
            ok: false,
            message: "Fallo de comunicación con la mesa de arbitraje al intentar leer el acta."
        });
    }
};

module.exports = {
    getEjercicio05
};