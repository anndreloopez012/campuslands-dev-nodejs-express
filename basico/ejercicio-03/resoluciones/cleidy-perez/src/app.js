const controller = require('./controllers/roster.controller');
const routes = require('./routes/roster.routes');
function main() { console.log('=== Ejercicio 03: modulos CommonJS ==='); console.table(routes.getRoutes()); console.log('\nRoster:'); console.table(controller.getRoster().players); console.log('\nEjemplo:', controller.getPlayer(1)); console.log('Ejercicio ejecutado correctamente.'); }
if (require.main === module) main();
module.exports = { main };
