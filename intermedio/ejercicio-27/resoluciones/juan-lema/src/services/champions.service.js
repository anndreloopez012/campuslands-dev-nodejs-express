import { AppError } from "../errors.js";

const ROLES = Object.freeze(["top", "jungla", "medio", "adc", "soporte"]);
const ID_PATTERN = /^[1-9]\d*$/;

const SEED_CHAMPIONS = Object.freeze([
  { name: "Kaelthas Furia", role: "medio", winRate: 51.3 },
  { name: "Roghar Muralla", role: "top", winRate: 49.8 },
  { name: "Nyssa Sombras", role: "jungla", winRate: 52.6 },
]);

const invalid = (code, message) => new AppError(400, code, message);

function checkName(name) {
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 40) throw invalid("INVALID_BODY", "name debe tener entre 2 y 40 caracteres");
}

function checkWinRate(winRate) {
  if (typeof winRate !== "number" || !(winRate >= 0 && winRate <= 100)) throw invalid("INVALID_BODY", "winRate debe ser un numero entre 0 y 100");
}

function createChampionsService({ seed = [] } = {}) {
  const champions = [];
  let nextId = 1;

  function findById(id) {
    if (!ID_PATTERN.test(id)) throw invalid("INVALID_ID", "id debe ser un entero positivo");

    const champion = champions.find((c) => c.id === Number(id));
    if (!champion) throw new AppError(404, "NOT_FOUND", `Campeon ${id} no encontrado`);
    return champion;
  }

  const list = ({ role } = {}) => {
    if (role !== undefined && !ROLES.includes(role)) throw invalid("INVALID_QUERY", `role debe ser uno de: ${ROLES.join(", ")}`);
    return champions.filter((c) => role === undefined || c.role === role).map((c) => ({ ...c }));
  };

  const getById = (id) => ({ ...findById(id) });

  function create({ name, role, winRate } = {}) {
    checkName(name);
    if (!ROLES.includes(role)) throw invalid("INVALID_BODY", `role debe ser uno de: ${ROLES.join(", ")}`);
    checkWinRate(winRate);

    const champion = { id: nextId++, name: name.trim(), role, winRate };
    champions.push(champion);
    return { ...champion };
  }

  seed.forEach(create);
  return { list, getById, create };
}

export { createChampionsService, SEED_CHAMPIONS, ROLES };
