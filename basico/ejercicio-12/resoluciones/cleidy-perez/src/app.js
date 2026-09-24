const { getMovieDetails } = require('./services/movie.service');
async function main() { console.log('=== Ejercicio 12: async await ==='); console.log(JSON.stringify(await getMovieDetails(1), null, 2)); console.log('Ejercicio ejecutado correctamente.'); }
main().catch((error) => { console.error('No se pudo cargar la película:', error.message); process.exitCode = 1; });
module.exports = { main };
