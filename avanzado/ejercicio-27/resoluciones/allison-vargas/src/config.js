const environments = new Set(['development', 'test', 'production']);
const logLevels = new Set(['error', 'warn', 'info', 'debug']);

function parsePort(value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT debe ser un entero entre 1 y 65535');
  return port;
}

function parseBoolean(value, name) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`${name} debe ser true o false`);
}

export function loadConfig(environment = process.env) {
  const nodeEnv = environment.NODE_ENV ?? 'development';
  const logLevel = environment.LOG_LEVEL ?? 'info';
  const serviceName = environment.SERVICE_NAME ?? 'moba-arena-api';
  if (!environments.has(nodeEnv)) throw new Error(`NODE_ENV debe ser uno de: ${[...environments].join(', ')}`);
  if (!logLevels.has(logLevel)) throw new Error(`LOG_LEVEL debe ser uno de: ${[...logLevels].join(', ')}`);
  if (!/^[a-z0-9-]{3,50}$/.test(serviceName)) throw new Error('SERVICE_NAME debe tener de 3 a 50 caracteres alfanuméricos o guiones');
  const origin = environment.CORS_ORIGIN ?? '*';
  if (origin !== '*') {
    try { new URL(origin); } catch { throw new Error('CORS_ORIGIN debe ser un origen URL válido'); }
  }
  return Object.freeze({
    nodeEnv,
    port: parsePort(environment.PORT ?? '3000'),
    logLevel,
    serviceName,
    trustProxy: parseBoolean(environment.TRUST_PROXY ?? 'false', 'TRUST_PROXY'),
    corsOrigin: origin
  });
}
