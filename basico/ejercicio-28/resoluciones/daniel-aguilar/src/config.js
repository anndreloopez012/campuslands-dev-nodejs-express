// Perfiles: valores por defecto de CADA entorno (no contienen secretos).
const PROFILES = {
  development: { port: 3000, logLevel: 'debug', maxPlayersPerMatch: 20, debugRoutes: true },
  test: { port: 0, logLevel: 'error', maxPlayersPerMatch: 4, debugRoutes: true },
  production: { port: 8080, logLevel: 'info', maxPlayersPerMatch: 100, debugRoutes: false },
};

const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];
const REQUIRED_IN_PRODUCTION = ['API_KEY'];

function parseInteger(raw, name, { min, max, fallback }) {
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} debe ser un entero entre ${min} y ${max} (recibido: "${raw}")`);
  }
  return value;
}

/**
 * Construye la configuracion final: perfil segun NODE_ENV + variables de entorno que lo sobrescriben.
 * Falla al arrancar si algo esta mal (fail fast), en lugar de descubrirlo a mitad de ejecucion.
 */
function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development';
  const profile = PROFILES[nodeEnv];
  if (!profile) {
    throw new Error(`NODE_ENV invalido "${nodeEnv}". Usa: ${Object.keys(PROFILES).join(', ')}`);
  }

  if (nodeEnv === 'production') {
    const missing = REQUIRED_IN_PRODUCTION.filter((name) => !env[name]);
    if (missing.length > 0) {
      throw new Error(`Faltan variables obligatorias en produccion: ${missing.join(', ')}`);
    }
  }

  const logLevel = env.LOG_LEVEL || profile.logLevel;
  if (!LOG_LEVELS.includes(logLevel)) {
    throw new Error(`LOG_LEVEL invalido "${logLevel}". Usa: ${LOG_LEVELS.join(', ')}`);
  }

  return Object.freeze({
    env: nodeEnv,
    port: parseInteger(env.PORT, 'PORT', { min: 1, max: 65535, fallback: profile.port }),
    logLevel,
    maxPlayersPerMatch: parseInteger(env.MAX_PLAYERS, 'MAX_PLAYERS', { min: 1, max: 1000, fallback: profile.maxPlayersPerMatch }),
    debugRoutes: profile.debugRoutes,
    apiKey: env.API_KEY || '',
  });
}

module.exports = { loadConfig, PROFILES };
