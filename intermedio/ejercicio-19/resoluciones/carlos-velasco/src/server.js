/**
 * Punto de entrada: separado de app.js para que la configuracion
 * y el levantamiento no esten acoplados (permite testear la app sin escuchar puertos).
 */
const app = require('./app');
const { getConfig } = require('./config/app.config');

const config = getConfig();

app.listen(config.puerto, () => {
  console.log(`${config.appTitle} ejecutandose en http://localhost:${config.puerto} (entorno: ${config.entorno})`);
});
