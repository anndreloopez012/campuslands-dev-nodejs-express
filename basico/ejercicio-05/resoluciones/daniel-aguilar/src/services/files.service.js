const fs = require('node:fs/promises');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Catalogo de archivos permitidos. "ghost" no existe a proposito para practicar ENOENT.
const CATALOG = {
  matches: 'matches.json',
  stadiums: 'stadiums.txt',
  ghost: 'ghost.txt',
};

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function readDataFile(key) {
  const fileName = CATALOG[key];
  if (!fileName) {
    throw httpError(404, `El archivo "${key}" no esta registrado`);
  }
  try {
    return await fs.readFile(path.join(DATA_DIR, fileName), 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw httpError(404, `El archivo "${fileName}" no existe en disco`);
    }
    throw error;
  }
}

async function getMatches() {
  const content = await readDataFile('matches');
  try {
    return JSON.parse(content);
  } catch {
    throw httpError(500, 'matches.json no contiene JSON valido');
  }
}

async function getStadiums() {
  const content = await readDataFile('stadiums');
  return content.split('\n').map((line) => line.trim()).filter(Boolean);
}

async function getFileInfo(key) {
  const content = await readDataFile(key);
  const stats = await fs.stat(path.join(DATA_DIR, CATALOG[key]));
  return {
    name: CATALOG[key],
    bytes: stats.size,
    lines: content.split('\n').filter(Boolean).length,
    modifiedAt: stats.mtime.toISOString(),
  };
}

module.exports = { getMatches, getStadiums, getFileInfo };
