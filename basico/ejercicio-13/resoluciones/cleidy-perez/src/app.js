const { loadMission } = require('./services/mission.service');
async function runCase(fail) { try { return { ok: true, mission: await loadMission({ fail }) }; } catch (error) { return { ok: false, name: error.name, message: error.message }; } }
async function main() { console.log('=== Ejercicio 13: manejo de errores ==='); console.log('Caso feliz:', await runCase(false)); console.log('Error esperado:', await runCase(true)); console.log('Ejercicio ejecutado correctamente.'); }
if (require.main === module) main().catch((error) => { console.error('Fallo no controlado:', error.message); process.exitCode = 1; });
module.exports = { runCase, main };
