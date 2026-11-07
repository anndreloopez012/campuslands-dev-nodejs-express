const characters = require("../data/characters.data");
const { NotFoundError, ValidationError } = require("../errors/app.error");

function list() {
  return characters;
}

function getById(id) {
  const idNumber = Number(id);
  if (!Number.isInteger(idNumber) || idNumber <= 0) {
    throw new ValidationError("El id del personaje debe ser un entero positivo");
  }
  const character = characters.find((c) => c.id === idNumber);
  if (!character) {
    throw new NotFoundError(`No existe el personaje con id ${idNumber}`);
  }
  return character;
}

function powerScore(character) {
  const { strength, dexterity, intelligence, vitality } = character.stats;
  return strength + dexterity + intelligence + vitality + character.level * 2;
}

module.exports = { list, getById, powerScore };
