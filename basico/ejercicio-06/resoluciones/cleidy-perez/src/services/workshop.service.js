const fs = require('node:fs/promises');
const path = require('node:path');
const dataRoot = path.resolve(__dirname, '..', 'data');
function getSafeDataPath(relativePath) { if (typeof relativePath !== 'string' || relativePath.includes('\0')) throw new Error('Ruta inválida'); const normalized = path.normalize(relativePath); if (path.isAbsolute(relativePath) || normalized === '..' || normalized.startsWith(`..${path.sep}`)) throw new Error('Ruta fuera del directorio permitido'); return path.join(dataRoot, normalized); }
async function readWorkshops() { return JSON.parse(await fs.readFile(getSafeDataPath('workshops.json'), 'utf8')); }
async function findWorkshop(slug) { return (await readWorkshops()).find((workshop) => workshop.slug === slug); }
module.exports = { dataRoot, getSafeDataPath, readWorkshops, findWorkshop };
