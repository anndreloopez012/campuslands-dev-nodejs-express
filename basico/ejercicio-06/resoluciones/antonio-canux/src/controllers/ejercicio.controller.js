const { ejecutarEjercicio } = require('../services/ejercicio.service');

const getEjercicio06 = async (req, res) => {
    try {
        const archivo = req.query.archivo;
        const data = await ejecutarEjercicio(archivo);
        res.status(200).json(data);
    } catch (error) {
        if (error.codigo === 'PATH_INSEGURO') {
            return res.status(403).json({
                ok: false,
                message: "403 Forbidden: La ruta indicada intenta salir del directorio permitido."
            });
        }

        if (error.codigo === 'NOT_FOUND') {
            return res.status(404).json({
                ok: false,
                message: "404 Not Found: El manual de mantenimiento solicitado no existe."
            });
        }

        console.error("Fallo inesperado en el taller:", error);
        res.status(500).json({
            ok: false,
            message: "Error interno al procesar la ruta en el servidor."
        });
    }
};

module.exports = {
    getEjercicio06
};