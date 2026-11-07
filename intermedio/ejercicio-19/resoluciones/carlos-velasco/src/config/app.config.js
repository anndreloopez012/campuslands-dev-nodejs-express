const { string, entero, lista, booleano } = require('./env');

/**
 * Config unica y validada: se lee una sola vez al arrancar.
 * Si algo falta o es invalido, la app muere aqui, no en la primera peticion.
 */
const configuracion = {
  puerto: entero('PORT', { default: 3000, min: 1, max: 65535 }),
  entorno: string('NODE_ENV', { default: 'development' }),
  studioName: string('STUDIO_NAME', { default: 'Estudio Tatuajes' }),
  appTitle: string('APP_TITLE', { default: 'Tatuajes API' }),
  servicios: lista('SERVICIOS', { default: 'tinta,retouch,diseno' }),
  permitirVisitalenta: booleano('STUDIO_MODO_CALMADO', { default: true })
};

function getConfig() {
  return configuracion;
}

module.exports = { getConfig };
