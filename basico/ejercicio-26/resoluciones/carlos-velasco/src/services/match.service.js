let matches = [
  {
    id: 1,
    name: "Clasificatoria nocturna",
    game: "Valorant",
    players: 10,
    status: "waiting"
  },
  {
    id: 2,
    name: "Torneo semanal",
    game: "Counter-Strike 2",
    players: 10,
    status: "started"
  },
  {
    id: 3,
    name: "Entrenamiento competitivo",
    game: "Overwatch 2",
    players: 10,
    status: "waiting"
  }
];

let nextId = 4;

function getAll() {
  return matches;
}

function getById(id) {
  return matches.find((match) => match.id === id);
}

function create(data) {
  const newMatch = {
    id: nextId++,
    ...data
  };

  matches.push(newMatch);

  return newMatch;
}

function start(id) {
  const match = matches.find((item) => item.id === id);

  if (!match) {
    return null;
  }

  match.status = "started";

  return match;
}

function remove(id) {
  const index = matches.findIndex((match) => match.id === id);

  if (index === -1) {
    return false;
  }

  matches.splice(index, 1);

  return true;
}

module.exports = {
  getAll,
  getById,
  create,
  start,
  remove
};