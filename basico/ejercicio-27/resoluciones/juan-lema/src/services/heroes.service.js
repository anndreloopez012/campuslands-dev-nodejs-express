const heroes = [
  { id: 1, name: "Invoker", role: "Mid" },
  { id: 2, name: "Axe", role: "Tanque" },
];
let nextId = 3;

function listHeroes() {
  return heroes;
}

function createHero({ name, role }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("name es obligatorio");
  }
  if (!role || typeof role !== "string" || !role.trim()) {
    throw new Error("role es obligatorio");
  }

  const hero = { id: nextId++, name: name.trim(), role: role.trim() };
  heroes.push(hero);
  return hero;
}

export { listHeroes, createHero };
