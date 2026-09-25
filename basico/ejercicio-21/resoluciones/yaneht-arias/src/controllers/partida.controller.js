const { crearPartida } = require("../services/partida.service");

function obtenerPartida() {
  return crearPartida();
}

module.exports = { obtenerPartida };
