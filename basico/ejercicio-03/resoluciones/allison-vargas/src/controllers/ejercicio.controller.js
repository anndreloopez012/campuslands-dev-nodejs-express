// Controlador: recibe la peticion HTTP, llama al servicio
// y arma la respuesta. No mezcla logica de negocio con la ruta.

const { obtenerResumenDraft, listarCampeones } = require('../services/draft.service');

function ejecutarEjercicio(req, res) {
  try {
    const draft = obtenerResumenDraft();

    return res.status(200).json({
      ok: true,
      message: 'Ejercicio ejecutado correctamente',
      topic: 'modulos CommonJS',
      draft,
    });
  } catch (error) {
    console.error('Error preparando el draft:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al ejecutar el ejercicio',
    });
  }
}

function obtenerCampeones(req, res) {
  try {
    return res.status(200).json({
      ok: true,
      campeones: listarCampeones(),
    });
  } catch (error) {
    console.error('Error listando campeones:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al listar los campeones',
    });
  }
}

module.exports = { ejecutarEjercicio, obtenerCampeones };
