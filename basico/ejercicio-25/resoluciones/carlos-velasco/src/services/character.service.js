let characters = [
  {
    id: 1,
    name: "Arthas",
    class: "Paladín",
    level: 45
  },
  {
    id: 2,
    name: "Lyra",
    class: "Maga",
    level: 32
  },
  {
    id: 3,
    name: "Gorn",
    class: "Guerrero",
    level: 28
  }
];

let nextId = 4;

function getAll() {
  return characters;
}

function getById(id) {
  return characters.find((character) => character.id === id);
}

function create(data) {
  const newCharacter = {
    id: nextId++,
    ...data
  };

  characters.push(newCharacter);

  return newCharacter;
}

function update(id, data) {
  const index = characters.findIndex((character) => character.id === id);

  if (index === -1) {
    return null;
  }

  characters[index] = {
    id,
    ...data
  };

  return characters[index];
}

function remove(id) {
  const index = characters.findIndex((character) => character.id === id);

  if (index === -1) {
    return false;
  }

  characters.splice(index, 1);

  return true;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};