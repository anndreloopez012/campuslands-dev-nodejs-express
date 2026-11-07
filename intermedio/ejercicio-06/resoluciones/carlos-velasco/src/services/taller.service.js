const { NotFoundError } = require('../errors/app.error');

const motos = [
  { id: 1, modelo: 'Titan 200', marca: 'Krantz', cilindrada: 200, tipo: 'naked', precio: 3850 },
  { id: 2, modelo: 'Vulcana S', marca: 'Nordica', cilindrada: 650, tipo: 'sport', precio: 9900 },
  { id: 3, modelo: 'Scoo Transit', marca: 'Urbana', cilindrada: 125, tipo: 'scooter', precio: 2100 }
];

const ordenes = [];

function listarMotos() {
  return motos;
}

function obtenerMoto(id) {
  const moto = motos.find((actual) => actual.id === id);
  if (!moto) throw new NotFoundError(`La moto con id ${id} no existe`);
  return moto;
}

function crearMoto(datos) {
  const nueva = { id: motos.length + 1, ...datos };
  motos.push(nueva);
  return nueva;
}

function listarOrdenes() {
  return ordenes.map((orden) => ({
    ...orden,
    moto: obtenerMoto(orden.motoId)
  }));
}

function crearOrden(datos) {
  const moto = obtenerMoto(datos.motoId);
  const orden = {
    id: ordenes.length + 1,
    motoId: moto.id,
    descripcion: datos.descripcion.trim(),
    horas: datos.horas,
    estado: 'abierta'
  };
  ordenes.push(orden);
  return orden;
}

module.exports = { listarMotos, obtenerMoto, crearMoto, listarOrdenes, crearOrden };
