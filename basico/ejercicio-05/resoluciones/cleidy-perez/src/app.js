const { dataFile, readTeams, findTeamByCity } = require('./services/teams.service');
async function main() { console.log('=== Ejercicio 05: fs para leer archivos ==='); console.log('Archivo leído:', dataFile); console.table(await readTeams()); console.log('Búsqueda:', await findTeamByCity('Guatemala')); console.log('Ejercicio ejecutado correctamente.'); }
main().catch((error) => { console.error('No se pudo leer el archivo:', error.message); process.exitCode = 1; });
module.exports = { main };
