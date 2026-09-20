
const rpgService = require('../services/rpg.service');

class RpgController {
  verificarEstado(req, res) {
    try {
      const resultado = rpgService.obtenerEstadoServidor();
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "Error interno en el servidor del RPG",
        error: error.message
      });
    }
  }
}

module.exports = new RpgController();