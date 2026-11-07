const maps = [
  { id: 1, name: 'Distrito 9', modo: 'tdm', maxJugadores: 12 },
  { id: 2, name: 'Torre Frente', modo: 'ctf', maxJugadores: 16 },
  { id: 3, name: 'Ruinas Verticales', modo: 'zone', maxJugadores: 8 }
];

const modosValidos = ['dm', 'tdm', 'ctf', 'zone'];

function listarMapas() {
  return maps;
}

function obtenerMapa(id) {
  return maps.find((mapa) => mapa.id === id) || null;
}

function crearMapa(datos) {
  const { name, modo, maxJugadores } = datos;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    throw new Error('El campo "name" es obligatorio y debe tener al menos 3 caracteres');
  }
  if (!modosValidos.includes(modo)) {
    throw new Error(`El modo "${modo}" no es valido. Modos disponibles: ${modosValidos.join(', ')}`);
  }
  if (!Number.isInteger(maxJugadores) || maxJugadores < 2 || maxJugadores > 24) {
    throw new Error('El campo "maxJugadores" debe ser un entero entre 2 y 24');
  }

  const nuevoMapa = {
    id: maps.length + 1,
    name: name.trim(),
    modo,
    maxJugadores
  };

  maps.push(nuevoMapa);
  return nuevoMapa;
}

function existeMapa(id) {
  return maps.some((mapa) => mapa.id === id);
}

module.exports = { listarMapas, obtenerMapa, crearMapa, existeMapa };
