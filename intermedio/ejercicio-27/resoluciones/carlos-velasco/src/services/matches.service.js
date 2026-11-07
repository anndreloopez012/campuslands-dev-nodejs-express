const { ValidationError } = require('../errors/app.error');
const { FORMATOS_PARTIDA } = require('../docs/api.docs');
const { obtenerCampeon } = require('./champions.service');

const partidas = [
  { id: 1, campeonId: 1, titulo: 'Cuartos LRF', formato: 'bo3' },
  { id: 2, campeonId: 3, titulo: 'Showdown', formato: 'bo1' }
];

function listarPartidas() {
  return partidas.map((partida) => ({ ...partida, campeon: obtenerCampeon(partida.campeonId) }));
}

function crearPartida(datos) {
  const { campeonId, titulo, formato } = datos;

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
    throw new ValidationError('El campo "titulo" es obligatorio (min 3 caracteres)');
  }
  if (!FORMATOS_PARTIDA.includes(formato)) {
    throw new ValidationError(`El formato "${formato}" no es valido. Formatos: ${FORMATOS_PARTIDA.join(', ')}`);
  }

  const campeon = obtenerCampeon(Number(campeonId));
  if (!campeon) {
    throw new ValidationError(`El campeon ${campeonId} no existe`);
  }

  const nueva = { id: partidas.length + 1, campeonId: campeon.id, titulo: titulo.trim(), formato };
  partidas.push(nueva);
  return nueva;
}

module.exports = { listarPartidas, crearPartida };
