import { AppError } from "../errors.js";

const CLASSES = Object.freeze(["guerrero", "mago", "picaro", "clerigo"]);
const SORTS = Object.freeze(["id", "name", "-name", "level", "-level"]);
const ALLOWED_FIELDS = Object.freeze({ create: ["name", "class", "level"], update: ["name", "level"] });
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const MAX_LEVEL = 60;
const ID_PATTERN = /^[1-9]\d*$/;

const SEED_CHARACTERS = Object.freeze([
  { name: "Lyra Alba", class: "clerigo", level: 12, ownerId: 1 },
  { name: "Thorin Escudo", class: "guerrero", level: 25, ownerId: 2 },
  { name: "Elowen", class: "mago", level: 8, ownerId: 1 },
  { name: "Grimm", class: "guerrero", level: 40, ownerId: 3 },
  { name: "Nyx", class: "picaro", level: 18, ownerId: 2 },
  { name: "Zephyr", class: "mago", level: 33, ownerId: 1 },
  { name: "Bran", class: "clerigo", level: 5, ownerId: 2 },
  { name: "Sable", class: "picaro", level: 27, ownerId: 3 },
]);

const nameKey = (name) => name.trim().normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const isInt = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const invalid = (code, message) => new AppError(400, code, message);

function readBody(body, allowed) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) throw invalid("INVALID_BODY", "El cuerpo debe ser un objeto JSON");

  const extra = Object.keys(body).find((key) => !allowed.includes(key));
  if (extra !== undefined) throw invalid("FIELD_NOT_ALLOWED", `Campo no permitido: ${extra.slice(0, 40)}`);
  return body;
}

function checkName(name) {
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 30) throw invalid("INVALID_BODY", "name debe tener entre 2 y 30 caracteres");
}

function checkLevel(level) {
  if (!isInt(level, 1, MAX_LEVEL)) throw invalid("INVALID_BODY", `level debe ser un entero entre 1 y ${MAX_LEVEL}`);
}

function createCharactersService({ seed = [] } = {}) {
  const characters = [];
  let nextId = 1;

  function findById(id) {
    if (!ID_PATTERN.test(id)) throw invalid("INVALID_ID", "id debe ser un entero positivo");

    const character = characters.find((c) => c.id === Number(id));
    if (!character) throw new AppError(404, "NOT_FOUND", `Personaje ${id} no encontrado`);
    return character;
  }

  function ensureNameFree(name, exceptId) {
    if (characters.some((c) => c.id !== exceptId && nameKey(c.name) === nameKey(name))) throw new AppError(409, "NAME_TAKEN", `El nombre "${name.trim()}" ya esta en uso`);
  }

  function ensureCanEdit(character, actor) {
    if (actor.role !== "admin" && character.ownerId !== actor.id) throw new AppError(403, "FORBIDDEN", "Solo el dueno del personaje o un admin puede hacerlo");
  }

  function list({ class: characterClass, minLevel, sort = "id", page = 1, limit = DEFAULT_LIMIT } = {}) {
    if (characterClass !== undefined && !CLASSES.includes(characterClass)) throw invalid("INVALID_QUERY", `class debe ser una de: ${CLASSES.join(", ")}`);
    if (minLevel !== undefined && !isInt(minLevel, 1, MAX_LEVEL)) throw invalid("INVALID_QUERY", `minLevel debe ser un entero entre 1 y ${MAX_LEVEL}`);
    if (!SORTS.includes(sort)) throw invalid("INVALID_QUERY", `sort debe ser uno de: ${SORTS.join(", ")}`);
    if (!isInt(page, 1, 1_000_000)) throw invalid("INVALID_QUERY", "page debe ser un entero mayor a 0");
    if (!isInt(limit, 1, MAX_LIMIT)) throw invalid("INVALID_QUERY", `limit debe ser un entero entre 1 y ${MAX_LIMIT}`);

    const descending = sort.startsWith("-");
    const key = descending ? sort.slice(1) : sort;
    const compare = (a, b) => {
      const order = key === "name" ? a.name.localeCompare(b.name, "es") : a[key] - b[key];
      return (descending ? -order : order) || a.id - b.id;
    };

    const matching = characters.filter((c) => (characterClass === undefined || c.class === characterClass) && (minLevel === undefined || c.level >= minLevel)).sort(compare);
    const start = (page - 1) * limit;

    return {
      items: matching.slice(start, start + limit).map((c) => ({ ...c })),
      meta: { page, limit, total: matching.length, totalPages: Math.max(1, Math.ceil(matching.length / limit)) },
    };
  }

  const getById = (id) => ({ ...findById(id) });

  function create(body, actor) {
    const { name, class: characterClass, level = 1 } = readBody(body, ALLOWED_FIELDS.create);
    checkName(name);
    if (!CLASSES.includes(characterClass)) throw invalid("INVALID_BODY", `class debe ser una de: ${CLASSES.join(", ")}`);
    checkLevel(level);
    ensureNameFree(name);

    const character = { id: nextId++, name: name.trim(), class: characterClass, level, ownerId: actor.id };
    characters.push(character);
    return { ...character };
  }

  function update(id, body, actor) {
    const character = findById(id);
    ensureCanEdit(character, actor);

    const changes = readBody(body, ALLOWED_FIELDS.update);
    if (Object.keys(changes).length === 0) throw invalid("INVALID_BODY", "No hay campos para actualizar");
    if ("name" in changes) {
      checkName(changes.name);
      ensureNameFree(changes.name, character.id);
    }
    if ("level" in changes) checkLevel(changes.level);

    if ("name" in changes) character.name = changes.name.trim();
    if ("level" in changes) character.level = changes.level;
    return { ...character };
  }

  function remove(id, actor) {
    const character = findById(id);
    ensureCanEdit(character, actor);
    characters.splice(characters.indexOf(character), 1);
  }

  seed.forEach(({ ownerId, ...character }) => create(character, { id: ownerId, role: "player" }));
  return { list, getById, create, update, remove };
}

export { createCharactersService, SEED_CHARACTERS };
