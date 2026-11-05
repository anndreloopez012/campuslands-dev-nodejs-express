let lobbies = [
  { id: 'LOBBY-101', mapa: 'Haven', maxJugadores: 10, jugadores: ['Sova99', 'PhoenixPro'], estado: 'Abierto' },
  { id: 'LOBBY-102', mapa: 'Bind', maxJugadores: 10, jugadores: ['JettAce', 'RazeBlast'], estado: 'Abierto' }
];

export const getLobbies = () => lobbies;

export const createLobby = ({ mapa, maxJugadores }) => {
  const id = `LOBBY-${Math.floor(100 + Math.random() * 900)}`;
  const newLobby = { id, mapa, maxJugadores: maxJugadores ? Number(maxJugadores) : 10, jugadores: [], estado: 'Abierto' };
  lobbies.push(newLobby);
  return newLobby;
};

export const joinLobby = (id, jugador) => {
  const lobby = lobbies.find(l => l.id === id);
  if (!lobby) {
    const err = new Error(`El lobby ${id} no existe.`);
    err.statusCode = 404;
    throw err;
  }
  if (lobby.jugadores.includes(jugador)) {
    const err = new Error(`El jugador ${jugador} ya está dentro del lobby.`);
    err.statusCode = 409; // Conflicto
    throw err;
  }
  if (lobby.jugadores.length >= lobby.maxJugadores) {
    const err = new Error(`El lobby ${id} está lleno.`);
    err.statusCode = 409;
    throw err;
  }
  lobby.jugadores.push(jugador);
  if (lobby.jugadores.length === lobby.maxJugadores) lobby.estado = 'Lleno / Listo';
  return lobby;
};

export const deleteLobby = (id) => {
  const idx = lobbies.findIndex(l => l.id === id);
  if (idx === -1) {
    const err = new Error(`Lobby ${id} no encontrado.`);
    err.statusCode = 404;
    throw err;
  }
  lobbies.splice(idx, 1);
  return true;
};
