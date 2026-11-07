const { ValidationError, NotFoundError } = require('../errors/app.error');

const heroes = [
  { id: 1, nombre: 'Talia Sombra', clase: 'asesina', nivel: 14 },
  { id: 2, nombre: 'Bruno Forn', clase: 'paladin', nivel: 9 }
];

const misiones = [
  { id: 1, titulo: 'Recuperar el Estandarte', dificultad: 'media', recompensa_oro: 250, heroeId: 1 },
  { id: 2, titulo: 'Limpiar la Cisterna', dificultad: 'facil', recompensa_oro: 90, heroeId: null }
];

const nivelesDificultad = ['facil', 'media', 'dificil'];

function listarHeroes() {
  return heroes;
}

function obtenerHeroe(id) {
  const heroe = heroes.find((actual) => actual.id === id);
  if (!heroe) throw new NotFoundError(`El heroe ${id} no existe`);
  return heroe;
}

function listarMisiones() {
  return misiones.map((mision) => ({
    ...mision,
    heroe: mision.heroeId ? obtenerHeroe(mision.heroeId) : null
  }));
}

function crearMision(datos) {
  const { titulo, dificultad, recompensa_oro, heroeId } = datos;

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 5) {
    throw new ValidationError('El campo "titulo" es obligatorio (minimo 5 caracteres)');
  }
  if (!nivelesDificultad.includes(dificultad)) {
    throw new ValidationError(`La dificultad debe ser: ${nivelesDificultad.join(', ')}`);
  }
  if (!Number.isInteger(recompensa_oro) || recompensa_oro <= 0) {
    throw new ValidationError('El campo "recompensa_oro" debe ser un entero positivo');
  }
  if (heroeId !== undefined && heroeId !== null) {
    obtenerHeroe(Number(heroeId)); // integridad referencial
  }

  const nueva = {
    id: misiones.length + 1,
    titulo: titulo.trim(),
    dificultad,
    recompensa_oro,
    heroeId: heroeId === undefined ? null : Number(heroeId)
  };
  misiones.push(nueva);
  return nueva;
}

function asignarMision(id, heroeId) {
  const mision = misiones.find((actual) => actual.id === id);
  if (!mision) throw new NotFoundError(`La mision ${id} no existe`);

  obtenerHeroe(heroeId);
  if (mision.heroeId && mision.heroeId !== heroeId) {
    throw new ValidationError(`La mision ya esta asignada al heroe ${mision.heroeId}`);
  }

  mision.heroeId = heroeId;
  return mision;
}

module.exports = { listarHeroes, obtenerHeroe, listarMisiones, crearMision, asignarMision };
