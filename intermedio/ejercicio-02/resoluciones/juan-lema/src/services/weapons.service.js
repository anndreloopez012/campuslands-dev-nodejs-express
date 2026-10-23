const CATEGORIES = ["rifle", "pistola", "francotirador", "escopeta"];

const weapons = [
  { id: 1, name: "Aegis-7", category: "rifle", damage: 34 },
  { id: 2, name: "Whisper", category: "francotirador", damage: 95 },
];
let nextId = 3;

function listWeapons() {
  return weapons;
}

function getWeaponById(id) {
  return weapons.find((weapon) => weapon.id === Number(id)) || null;
}

function createWeapon({ name, category, damage }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("name es obligatorio");
  }

  if (!category || !CATEGORIES.includes(category)) {
    throw new Error(`category debe ser una de: ${CATEGORIES.join(", ")}`);
  }

  const numericDamage = Number(damage);
  if (!damage || Number.isNaN(numericDamage) || numericDamage <= 0) {
    throw new Error("damage debe ser un numero mayor a 0");
  }

  const weapon = { id: nextId++, name: name.trim(), category, damage: numericDamage };
  weapons.push(weapon);
  return weapon;
}

export { listWeapons, getWeaponById, createWeapon };
