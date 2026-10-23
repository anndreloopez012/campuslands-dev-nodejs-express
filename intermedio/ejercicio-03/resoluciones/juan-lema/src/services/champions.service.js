const ROLES = ["tanque", "asesino", "mago", "soporte", "tirador"];

const champions = [
  { id: 1, name: "Kaelen", role: "asesino", winRate: 52.3 },
  { id: 2, name: "Morrgath", role: "tanque", winRate: 49.8 },
];
let nextId = 3;

const listChampions = () => champions;
const getChampionById = (id) => champions.find((c) => c.id === Number(id)) || null;

function createChampion({ name, role, winRate }) {
  if (!name || typeof name !== "string" || !name.trim()) throw new Error("name es obligatorio");
  if (!role || !ROLES.includes(role)) throw new Error(`role debe ser uno de: ${ROLES.join(", ")}`);

  const rate = winRate === undefined ? 50 : Number(winRate);
  if (Number.isNaN(rate) || rate < 0 || rate > 100) throw new Error("winRate debe ser un numero entre 0 y 100");

  const champion = { id: nextId++, name: name.trim(), role, winRate: rate };
  champions.push(champion);
  return champion;
}

export { listChampions, getChampionById, createChampion };
