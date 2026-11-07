const heroesData = require("../data/heroes.data");
const { ValidationError, NotFoundError } = require("../errors/app.error");

function listHeroes(role) {
  const heroes = heroesData.list();
  if (!role) {
    return heroes;
  }
  return heroes.filter((hero) => hero.role === role);
}

function getHeroById(id) {
  const hero = heroesData.list().find((h) => h.id === Number(id));
  if (!hero) {
    throw new NotFoundError(`No existe el heroe con id ${id}`);
  }
  return hero;
}

function createHero(heroInput) {
  const duplicated = heroesData
    .list()
    .some((hero) => hero.name.toLowerCase() === heroInput.name.toLowerCase());
  if (duplicated) {
    throw new ValidationError("Ya existe un heroe con ese nombre", ["$.name ya esta en uso"]);
  }
  return heroesData.create(heroInput);
}

module.exports = { listHeroes, getHeroById, createHero };
