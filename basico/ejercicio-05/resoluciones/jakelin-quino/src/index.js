const { readFile } = require('node:fs/promises');
const { join } = require('node:path');

async function readTeams() {
  const filePath = join(__dirname, '..', 'data', 'teams.json');
  const file = await readFile(filePath, 'utf8');
  return JSON.parse(file);
}

async function main() {
  try {
    const teams = await readTeams();
    console.log(`Equipos encontrados: ${teams.length}`);
    for (const team of teams) {
      console.log(`${team.name} - ${team.sport} - ${team.city}`);
    }
  } catch (error) {
    console.error(`No se pudo leer la informacion: ${error.message}`);
    process.exitCode = 1;
  }
}

main();