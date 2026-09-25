const fs = require('node:fs/promises');
const path = require('node:path');
const dataFile = path.join(__dirname, '..', 'data', 'teams.json');
async function readTeams() { return JSON.parse(await fs.readFile(dataFile, 'utf8')); }
async function findTeamByCity(city) { return (await readTeams()).find((team) => team.city.toLowerCase() === city.toLowerCase()); }
module.exports = { dataFile, readTeams, findTeamByCity };
