const WEIGHT_CLASSES = ["pluma", "ligero", "medio", "pesado"];

const fighters = [
  { id: 1, name: "Milo Vance", weightClass: "ligero", wins: 14 },
  { id: 2, name: "Rhea Solari", weightClass: "pluma", wins: 9 },
  { id: 3, name: "Darius Cole", weightClass: "pesado", wins: 21 },
  { id: 4, name: "Kenji Arata", weightClass: "medio", wins: 11 },
  { id: 5, name: "Nadia Cruz", weightClass: "ligero", wins: 7 },
  { id: 6, name: "Omar Reyes", weightClass: "pesado", wins: 16 },
];
let nextId = 7;

function listFighters({ page = 1, limit = 5, weightClass } = {}) {
  const filtered = weightClass ? fighters.filter((f) => f.weightClass === weightClass) : fighters;
  const total = filtered.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const start = (page - 1) * limit;

  return { data: filtered.slice(start, start + limit), page, limit, total, totalPages };
}

const getFighterById = (id) => fighters.find((f) => f.id === Number(id)) || null;

function createFighter({ name, weightClass, wins }) {
  if (!name || typeof name !== "string" || !name.trim()) throw new Error("name es obligatorio");
  if (!weightClass || !WEIGHT_CLASSES.includes(weightClass)) throw new Error(`weightClass debe ser una de: ${WEIGHT_CLASSES.join(", ")}`);

  const numericWins = wins === undefined ? 0 : Number(wins);
  if (Number.isNaN(numericWins) || numericWins < 0) throw new Error("wins debe ser un numero mayor o igual a 0");

  const fighter = { id: nextId++, name: name.trim(), weightClass, wins: numericWins };
  fighters.push(fighter);
  return fighter;
}

export { WEIGHT_CLASSES, listFighters, getFighterById, createFighter };
