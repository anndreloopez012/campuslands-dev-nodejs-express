const { ValidationError, NotFoundError } = require('../errors/app.error');

const naves = [
  { id: 1, nombre: 'Vela Estelar', clase: 'exploracion', tripulacion: 42 },
  { id: 2, nombre: 'Chispa Roja', clase: 'carga', tripulacion: 18 },
  { id: 3, nombre: 'Orion Segundo', clase: 'exploracion', tripulacion: 55 }
];

const misiones = [
  { id: 1, naveId: 1, destino: 'Cinturon de Perala', estado: 'en curso' },
  { id: 2, naveId: 2, destino: 'Puerto Olimpo', estado: 'completada' }
];

const clasesValidas = ['exploracion', 'carga', 'combate'];
const estadosValidos = ['planificada', 'en curso', 'completada', 'abortada'];

function listarNaves() {
  return naves.map((nave) => ({
    ...nave,
    misiones_asignadas: misiones.filter((mision) => mision.naveId === nave.id).length
  }));
}

function obtenerNave(id) {
  const nave = naves.find((actual) => actual.id === id);
  if (!nave) throw new NotFoundError(`La nave ${id} no existe`);
  return nave;
}

function crearNave(datos) {
  const { nombre, clase, tripulacion } = datos;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
    throw new ValidationError('El campo "nombre" es obligatorio (minimo 3 caracteres)');
  }
  if (!clasesValidas.includes(clase)) {
    throw new ValidationError(`La clase "${clase}" no es valida. Clases: ${clasesValidas.join(', ')}`);
  }
  if (!Number.isInteger(tripulacion) || tripulacion < 1) {
    throw new ValidationError('El campo "tripulacion" debe ser un entero >= 1');
  }

  const nueva = { id: naves.length + 1, nombre: nombre.trim(), clase, tripulacion };
  naves.push(nueva);
  return nueva;
}

function listarMisiones() {
  return misiones.map((mision) => ({
    ...mision,
    nave: mision.naveId === null ? null : obtenerNave(mision.naveId)
  }));
}

function crearMision(datos) {
  const { naveId, destino, estado } = datos;

  const naveAsignada = naveId === null ? null : naveId;

  if (naveAsignada !== null) {
    if (!Number.isInteger(naveAsignada)) {
      throw new ValidationError('El campo "naveId" debe ser un numero o null (mision sin nave asignada)');
    }
    obtenerNave(naveAsignada); // relacional: la nave debe existir
  }
  if (!destino || typeof destino !== 'string' || destino.trim().length < 3) {
    throw new ValidationError('El campo "destino" es obligatorio (minimo 3 caracteres)');
  }
  if (!estadosValidos.includes(estado)) {
    throw new ValidationError(`El estado "${estado}" no es valido. Estados: ${estadosValidos.join(', ')}`);
  }

  const nueva = {
    id: misiones.length + 1,
    naveId: naveAsignada,
    destino: destino.trim(),
    estado
  };
  misiones.push(nueva);
  return nueva;
}

function asignarMision(misionId, naveId) {
  const mision = misiones.find((actual) => actual.id === misionId);
  if (!mision) throw new NotFoundError(`La mision ${misionId} no existe`);

  if (mision.estado === 'completada' || mision.estado === 'abortada') {
    throw new ValidationError(`No se puede asignar una nave a una mision ${mision.estado}`);
  }

  obtenerNave(naveId); // valida relaciones
  mision.naveId = naveId;
  return mision;
}

/**
 * Eliminar una nave NO elimina las misiones: quedan como huerfanas
 * con naveId = null para mostrar como se maneja la relacion.
 */
function eliminarNave(id) {
  obtenerNave(id);
  const indice = naves.findIndex((nave) => nave.id === id);
  naves.splice(indice, 1);
  let huerfanas = 0;
  for (const mision of misiones) {
    if (mision.naveId === id) {
      mision.naveId = null;
      huerfanas += 1;
    }
  }
  return huerfanas;
}

module.exports = { listarNaves, listarMisiones, crearNave, crearMision, asignarMision, eliminarNave };
