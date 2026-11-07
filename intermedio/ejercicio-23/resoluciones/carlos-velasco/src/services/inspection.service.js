const { ValidationError, NotFoundError } = require('../errors/app.error');
const { evaluarJunta, clasificar } = require('./weld.service');

const inspecciones = [];

function listarInspecciones() {
  return inspecciones;
}

function registrarInspeccion(datos) {
  const evaluacion = evaluarJunta(datos);
  if (!evaluacion.valida) {
    throw new ValidationError(`Junta rechazada: ${evaluacion.motivo}`);
  }

  const registro = {
    id: inspecciones.length + 1,
    tipo: datos.tipo,
    penetracion_pct: datos.penetracion_pct,
    porosidad: datos.porosidad === undefined ? null : datos.porosidad,
    resistencia_mpa: evaluacion.resistencia_mpa,
    clase: clasificar(evaluacion.resistencia_mpa)
  };
  inspecciones.push(registro);
  return registro;
}

function consultarInspeccion(id) {
  const registro = inspecciones.find((actual) => actual.id === id);
  if (!registro) throw new NotFoundError(`La inspeccion ${id} no existe`);
  return registro;
}

module.exports = { listarInspecciones, registrarInspeccion, consultarInspeccion };
