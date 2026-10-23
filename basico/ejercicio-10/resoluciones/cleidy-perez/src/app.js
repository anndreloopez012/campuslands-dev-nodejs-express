const { playMatch } = require('./services/rally.service');
async function main() { console.log('=== Ejercicio 10: funciones asincronas ==='); console.log(JSON.stringify(await playMatch(), null, 2)); console.log('Ejercicio ejecutado correctamente.'); }
main().catch((error) => { console.error('Error durante la jugada:', error.message); process.exitCode = 1; });
module.exports = { main };
