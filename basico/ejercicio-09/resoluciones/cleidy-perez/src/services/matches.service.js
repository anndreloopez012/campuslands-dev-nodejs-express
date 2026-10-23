const fs = require('node:fs/promises'); const path = require('node:path');
const dataFile = path.join(__dirname, '..', 'data', 'matches.json');
async function readMatches() { return JSON.parse(await fs.readFile(dataFile, 'utf8')); }
async function writeMatches(matches) { await fs.writeFile(dataFile, `${JSON.stringify(matches, null, 2)}\n`, 'utf8'); }
async function addMatch(input) { if (!input?.fighter || !Number.isFinite(input.rounds) || input.rounds < 1) throw new Error('Se requiere fighter y rounds mayor que cero'); const matches = await readMatches(); const match = { id: matches.length + 1, ...input, createdAt: new Date().toISOString() }; matches.push(match); await writeMatches(matches); return match; }
module.exports = { dataFile, readMatches, addMatch };
