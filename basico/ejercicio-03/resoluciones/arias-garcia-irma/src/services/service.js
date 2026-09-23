const heroes = [
  { id: 1, name: "Ahri", role: "Mage", tier: "S" },
  { id: 2, name: "Lee Sin", role: "Jungle", tier: "A" }
];

const getHeroes = () => heroes;

const addHero = (heroData) => {
  const newHero = { id: heroes.length + 1, ...heroData };
  heroes.push(newHero);
  return newHero;
};

module.exports = {
  getHeroes,
  addHero
};