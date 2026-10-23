const { dataFile, readMatches, addMatch } = require('./services/matches.service');
async function main() { console.log('=== Ejercicio 09: JSON y persistencia simple ==='); const existing = await readMatches(); const created = await addMatch({ fighter: 'Luna', opponent: 'Rayo', rounds: 3, winner: 'Luna' }); console.log('Archivo:', dataFile); console.log('Combates anteriores:', existing.length); console.log('Combate creado:', created); console.log('Total persistido:', (await readMatches()).length); console.log('Ejercicio ejecutado correctamente.'); }
main().catch((error) => { console.error('No se pudo actualizar la persistencia:', error.message); process.exitCode = 1; });
module.exports = { main };
