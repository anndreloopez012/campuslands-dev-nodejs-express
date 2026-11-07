const { ValidationError, NotFoundError } = require('../errors/app.error');
const { FutbolRepository } = require('../repositories/futbol.repository');

const repositorio = new FutbolRepository();

const POSICIONES = ['arquero', 'defensor', 'mediocampista', 'delantero'];

function listarEquipos({ ciudad }) {
  if (ciudad) {
    return repositorio.allWhere('equipos', (equipo) =>
      equipo.ciudad.toLowerCase() === String(ciudad).toLowerCase()
    );
  }
  return repositorio.all('equipos');
}

function crearEquipo(datos) {
  const { nombre, ciudad } = datos;

  reglasEquipo({ nombre, ciudad });
  if (repositorio.allWhere('equipos', (e) => e.nombre.toLowerCase() === nombre.toLowerCase()).length > 0) {
    throw new ValidationError(`El equipo "${nombre}" ya existe`);
  }

  return repositorio.save('equipos', { nombre: nombre.trim(), ciudad: ciudad.trim() });
}

function listarPlantilla(equipoId) {
  const equipo = repositorio.find('equipos', equipoId);
  if (!equipo) throw new NotFoundError(`El equipo ${equipoId} no existe`);
  return { equipo, plantilla: repositorio.allWhere('jugadores', (j) => j.equipoId === equipoId) };
}

function crearJugador(equipoId, datos) {
  const { nombre, posicion } = datos;

  const equipo = repositorio.find('equipos', equipoId);
  if (!equipo) throw new NotFoundError(`El equipo ${equipoId} no existe`);

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
    throw new ValidationError('El campo "nombre" es obligatorio (min 3 caracteres)');
  }
  if (!POSICIONES.includes(posicion)) {
    throw new ValidationError(`La posicion debe ser: ${POSICIONES.join(', ')}`);
  }

  return repositorio.save('jugadores', { equipoId, nombre: nombre.trim(), posicion });
}

function borrarEquipo(equipoId) {
  const equipo = repositorio.find('equipos', equipoId);
  if (!equipo) throw new NotFoundError(`El equipo ${equipoId} no existe`);

  // Regla nueva del refactor: borrar equipo libera plantilla en cascada CONTROLADA
  let jugadores = repositorio.allWhere('jugadores', (jugador) => jugador.equipoId === equipoId);
  for (const jugador of jugadores) repositorio.remove('jugadores', jugador.id);

  repositorio.remove('equipos', equipoId);
  return { equipo: equipo.nombre, jugadores_liberados: jugadores.length };
}

function reglasEquipo({ nombre, ciudad }) {
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
    throw new ValidationError('El campo "nombre" es obligatorio (min 3 caracteres)');
  }
  if (!ciudad || typeof ciudad !== 'string' || ciudad.trim().length < 3) {
    throw new ValidationError('El campo "ciudad" es obligatorio (min 3 caracteres)');
  }
}

module.exports = { listarEquipos, crearEquipo, listarPlantilla, crearJugador, borrarEquipo };
