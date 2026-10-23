// Servicio: arma el resumen del draft.
// Aqui se ve el patron CommonJS: cada archivo exporta solo lo que
// otros modulos necesitan, con module.exports, y se importa con require().

const { campeones } = require('../data/campeones.data');

function obtenerResumenDraft() {
  const roles = campeones.map((campeon) => campeon.rol);
  const rolesUnicos = [...new Set(roles)];

  return {
    total_campeones_disponibles: campeones.length,
    roles_disponibles: rolesUnicos,
  };
}

function listarCampeones() {
  return campeones;
}

module.exports = { obtenerResumenDraft, listarCampeones };
