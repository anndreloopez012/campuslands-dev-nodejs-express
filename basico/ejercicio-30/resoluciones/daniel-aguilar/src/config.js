const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];

function loadConfig(env = process.env) {
  const port = env.PORT === undefined || env.PORT === '' ? 3000 : Number(env.PORT);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`PORT invalido: "${env.PORT}"`);
  }
  const logLevel = env.LOG_LEVEL || 'info';
  if (!LOG_LEVELS.includes(logLevel)) {
    throw new Error(`LOG_LEVEL invalido "${logLevel}". Usa: ${LOG_LEVELS.join(', ')}`);
  }
  return Object.freeze({ port, nodeEnv: env.NODE_ENV || 'development', logLevel });
}

module.exports = { loadConfig, LOG_LEVELS };
