const matches = [
  { id: 1, mapId: 1, titulo: 'Scrim Semifinal', estado: 'programada', fecha: '2026-11-10T18:00:00.000Z' },
  { id: 2, mapId: 2, titulo: 'Copa Regional', estado: 'finalizada', fecha: '2026-11-01T20:00:00.000Z' }
];

const estadosValidos = ['programada', 'en_curso', 'finalizada'];

function listarPartidas() {
  return matches;
}

function obtenerPartida(id) {
  return matches.find((partida) => partida.id === id) || null;
}

function crearPartida(datos, mapsService) {
  const { mapId, titulo, estado, fecha } = datos;

  if (!Number.isInteger(mapId) || !mapsService.existeMapa(mapId)) {
    throw new Error(`El campo "mapId" debe referenciar un mapa existente`);
  }
  if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
    throw new Error('El campo "titulo" es obligatorio y debe tener al menos 3 caracteres');
  }
  if (!estadosValidos.includes(estado)) {
    throw new Error(`El estado "${estado}" no es valido. Estados: ${estadosValidos.join(', ')}`);
  }
  if (!fecha || Number.isNaN(Date.parse(fecha))) {
    throw new Error('El campo "fecha" debe ser una fecha valida en formato ISO');
  }

  const nuevaPartida = {
    id: matches.length + 1,
    mapId,
    titulo: titulo.trim(),
    estado,
    fecha
  };

  matches.push(nuevaPartida);
  return nuevaPartida;
}

module.exports = { listarPartidas, obtenerPartida, crearPartida };
