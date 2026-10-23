const fs = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_FILE = path.join(__dirname, '..', 'data', 'fighters.json');
// Se lee en cada llamada para poder usar otro archivo en las pruebas (FIGHTERS_FILE).
const dbFile = () => process.env.FIGHTERS_FILE || DEFAULT_FILE;

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Cola simple: evita que dos escrituras simultaneas se pisen entre si.
let queue = Promise.resolve();
function withLock(task) {
  const result = queue.then(task);
  queue = result.catch(() => {});
  return result;
}

async function readAll() {
  let content;
  try {
    content = await fs.readFile(dbFile(), 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  try {
    return JSON.parse(content);
  } catch {
    throw httpError(500, 'El archivo de datos esta corrupto');
  }
}

// Escritura "atomica": se escribe en un temporal y luego se renombra.
async function writeAll(fighters) {
  const tmp = `${dbFile()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(fighters, null, 2) + '\n', 'utf-8');
  await fs.rename(tmp, dbFile());
}

function validate(data) {
  const errors = [];
  if (typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.trim().length > 60) {
    errors.push('name debe ser texto de 2 a 60 caracteres');
  }
  if (typeof data.weightClass !== 'string' || data.weightClass.trim() === '') {
    errors.push('weightClass es obligatorio');
  }
  for (const field of ['wins', 'losses']) {
    if (!Number.isInteger(data[field]) || data[field] < 0) {
      errors.push(`${field} debe ser un entero mayor o igual a 0`);
    }
  }
  return errors;
}

const listFighters = () => readAll();

async function getFighter(id) {
  const fighters = await readAll();
  return fighters.find((fighter) => fighter.id === id) || null;
}

function createFighter(data) {
  const errors = validate(data || {});
  if (errors.length > 0) {
    const error = httpError(400, 'Datos invalidos');
    error.details = errors;
    throw error;
  }
  return withLock(async () => {
    const fighters = await readAll();
    const name = data.name.trim();
    if (fighters.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      throw httpError(409, `Ya existe un peleador llamado "${name}"`);
    }
    const nextId = fighters.reduce((max, f) => Math.max(max, f.id), 0) + 1;
    const fighter = {
      id: nextId,
      name,
      weightClass: data.weightClass.trim(),
      wins: data.wins,
      losses: data.losses,
    };
    fighters.push(fighter);
    await writeAll(fighters);
    return fighter;
  });
}

module.exports = { listFighters, getFighter, createFighter };
