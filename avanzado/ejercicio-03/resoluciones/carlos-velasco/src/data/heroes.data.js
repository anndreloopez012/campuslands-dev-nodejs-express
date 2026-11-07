const heroStore = new Map([
  [1, {
    id: 1,
    name: "Sylvas",
    role: "carry",
    difficulty: 8,
    stats: { hp: 900, mana: 280, attackDamage: 64, spellPower: 0 },
    abilities: [{ name: "Flecha Celtic", cooldown: 12, manaCost: 40 }],
  }],
]);
let nextId = 2;

function list() {
  return [...heroStore.values()];
}

function create(hero) {
  const created = { id: nextId++, registeredAt: new Date().toISOString(), ...hero };
  heroStore.set(created.id, created);
  return created;
}

module.exports = { list, create };
