const { NotFoundError, ConflictError, ValidationError } = require('../errors/app.error');

const autos = [
  { id: 1, modelo: 'Fenix GT', marca: 'Aurelio', precio: 359000, estado: 'disponible' },
  { id: 2, modelo: 'Fenix GT', marca: 'Aurelio', precio: 362000, estado: 'reservado' },
  { id: 3, modelo: 'Sombra V8', marca: 'Kalter', precio: 511000, estado: 'disponible' }
];

function listarAutos() {
  return autos;
}

function obtenerAuto(id) {
  const auto = autos.find((actual) => actual.id === id);
  if (!auto) throw new NotFoundError(`El auto con id ${id} no existe en el showroom`);
  return auto;
}

function reservarAuto(id, datos) {
  if (!datos || typeof datos !== 'object' || Object.keys(datos).length === 0) {
    throw new ValidationError('El cuerpo de la peticion no puede estar vacio');
  }

  const auto = obtenerAuto(id);

  if (auto.estado === 'reservado') {
    throw new ConflictError(`El auto ${id} ya tiene una reserva activa`);
  }

  auto.estado = 'reservado';
  auto.reservadoPor = datos.cliente;
  return auto;
}

function liberarAuto(id) {
  const auto = obtenerAuto(id);

  if (auto.estado !== 'reservado') {
    throw new ConflictError('Solo se puede liberar un auto que este reservado');
  }

  auto.estado = 'disponible';
  delete auto.reservadoPor;
  return auto;
}

async function listarAutosLento() {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return listarAutos();
}

module.exports = { listarAutos, listarAutosLento, obtenerAuto, reservarAuto, liberarAuto };
