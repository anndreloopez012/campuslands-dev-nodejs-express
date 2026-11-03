const packageJson = require('../package.json');
function printTechnicalCard() { console.log('=== Ejercicio 29: README tecnico ==='); console.log(JSON.stringify({ name: packageJson.name, version: packageJson.version, runtime: process.version, entrypoint: 'src/app.js', dependencies: 'ninguna', checks: ['npm run check', 'npm start'] }, null, 2)); console.log('La documentación de esta entrega describe el contrato y los comandos.'); }
if (require.main === module) printTechnicalCard();
module.exports = { printTechnicalCard };
