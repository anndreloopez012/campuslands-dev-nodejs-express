const { getConfig } = require('../config/app.config');
const { ValidationError, NotFoundError } = require('../errors/app.error');

const config = getConfig();

const turnos = [
  { id: 1, cliente: 'Lu Mesas', servicio: 'tinta', horas: 2.5 },
  { id: 2, cliente: 'Dibu Cay', servicio: 'retouch', horas: 1 }
];

function listarServicios() {
  return config.servicios.map((servicio) => ({ servicio, disponible: true }));
}

function reservar(datos) {
  const { cliente, servicio, horas } = datos;

  if (!cliente || typeof cliente !== 'string' || cliente.trim().length < 3) {
    throw new ValidationError('El campo "cliente" es obligatorio (minimo 3 caracteres)');
  }
  if (!config.servicios.includes(servicio)) {
    throw new ValidationError(`El servicio "${servicio}" no esta habilitado en SERVICIOS. Habilitados: ${config.servicios.join(', ')}`);
  }
  if (typeof horas !== 'number' || horas <= 0) {
    throw new ValidationError('El campo "horas" debe ser un numero positivo');
  }

  const nuevo = { id: turnos.length + 1, cliente: cliente.trim(), servicio, horas };
  turnos.push(nuevo);
  return nuevo;
}

function horarioInfo() {
  return {
    studio: config.studioName,
    titulo: config.appTitle,
    servicio_reporte: config.servicios[1],
    modo_calmado: config.permitirVisitalenta,
    entorno: config.entorno
  };
}

function cancelar(id) {
  const indice = turnos.findIndex((turno) => turno.id === id);
  if (indice === -1) throw new NotFoundError(`El turno ${id} no existe`);
  const [cancelado] = turnos.splice(indice, 1);
  return cancelado;
}

module.exports = { listarServicios, reservar, horarioInfo, cancelar };
