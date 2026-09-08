const { generarRespuesta } = require(`../services/service`);

function ejecutarEjercicio(req, res) {
    try{
        const resultado = generarRespuesta();

        return res.status(200).json(resultado);

    } catch (error) {
        console.error('Error en ejecutarEjercicio:', error.message);

        return res.status(500).json({ok: false, message: 'No se pudo ejecutar el ejercicio'});
    }
}

module.exports = { ejecutarEjercicio };

