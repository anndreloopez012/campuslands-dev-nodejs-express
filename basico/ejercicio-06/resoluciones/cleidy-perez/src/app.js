const { getSafeDataPath, readWorkshops, findWorkshop } = require('./services/workshop.service');
async function main() { console.log('=== Ejercicio 06: path y rutas seguras ==='); console.log('Ruta segura:', getSafeDataPath('workshops.json')); console.table(await readWorkshops()); console.log('Taller motor:', await findWorkshop('motor')); try { getSafeDataPath('../package.json'); } catch (error) { console.log('Ruta bloqueada:', error.message); } console.log('Ejercicio ejecutado correctamente.'); }
main().catch((error) => { console.error('Error inesperado:', error.message); process.exitCode = 1; });
module.exports = { main };
