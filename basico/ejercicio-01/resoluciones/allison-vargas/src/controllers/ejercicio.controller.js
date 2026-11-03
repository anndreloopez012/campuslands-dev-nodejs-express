// Controlador: recibe la peticion HTTP, llama al servicio
// y arma la respuesta. No mezcla logica de negocio con la ruta.

const { mostrarEstadoDelMundo } = require('../services/mundo.service');

function ejecutarEjercicio(req, res) {
  try {
    console.log('Un aventurero llego a la aldea y pidio informacion del mundo...');

    const estadoDelMundo = mostrarEstadoDelMundo();

    return res.status(200).json({
      ok: true,
      message: 'Ejercicio ejecutado correctamente',
      topic: 'Node runtime y consola',
      estado_del_mundo: estadoDelMundo,
    });
  } catch (error) {
    console.error('Un error interrumpio la aventura:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al ejecutar el ejercicio',
    });
  }
}

module.exports = { ejecutarEjercicio };
