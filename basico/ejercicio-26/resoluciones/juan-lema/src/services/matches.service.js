const matches = [{ id: 1, name: "Ranked #1", maxPlayers: 2, players: [] }];
let nextId = 2;

function listMatches() {
  return matches;
}

function getMatchById(id) {
  return matches.find((m) => m.id === Number(id)) || null;
}

function createMatch({ name, maxPlayers }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    const error = new Error("name es obligatorio");
    error.status = 400;
    throw error;
  }

  const numericMax = Number(maxPlayers);
  if (!maxPlayers || Number.isNaN(numericMax)) {
    const error = new Error("maxPlayers es obligatorio y numerico");
    error.status = 400;
    throw error;
  }

  if (numericMax < 2) {
    const error = new Error("maxPlayers debe ser al menos 2 (partida competitiva)");
    error.status = 422;
    throw error;
  }

  const match = { id: nextId++, name: name.trim(), maxPlayers: numericMax, players: [] };
  matches.push(match);
  return match;
}

function joinMatch(id, playerName) {
  const match = getMatchById(id);
  if (!match) {
    const error = new Error(`Partida con id ${id} no encontrada`);
    error.status = 404;
    throw error;
  }

  if (match.players.length >= match.maxPlayers) {
    const error = new Error("La partida ya esta llena");
    error.status = 409;
    throw error;
  }

  match.players.push(playerName);
  return match;
}

function deleteMatch(id) {
  const index = matches.findIndex((m) => m.id === Number(id));
  if (index === -1) return false;
  matches.splice(index, 1);
  return true;
}

export { listMatches, getMatchById, createMatch, joinMatch, deleteMatch };
