const fs = require('node:fs');
const path = require('node:path');

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const SENSITIVE_KEYS = ['password', 'token', 'apikey', 'authorization', 'secret'];

// Reemplaza valores sensibles para que NUNCA terminen escritos en los logs.
function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [
        key,
        SENSITIVE_KEYS.some((word) => key.toLowerCase().includes(word)) ? '[REDACTED]' : redact(inner),
      ])
    );
  }
  return value;
}

function consoleWriter(line, level) {
  (level === 'error' ? console.error : console.log)(line);
}

// Ademas de la consola, agrega cada linea a un archivo (LOG_FILE).
function fileWriter(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const stream = fs.createWriteStream(filePath, { flags: 'a' });
  return (line, level) => {
    consoleWriter(line, level);
    stream.write(line + '\n');
  };
}

/**
 * Formato de cada linea:  2026-10-03T16:20:00.000Z INFO  mensaje {"clave":"valor"}
 * Solo se escriben los mensajes cuyo nivel sea >= al nivel configurado.
 */
function createLogger({ level = 'info', write = consoleWriter, now = () => new Date() } = {}) {
  if (!(level in LEVELS)) {
    throw new Error(`LOG_LEVEL invalido "${level}". Usa: ${Object.keys(LEVELS).join(', ')}`);
  }
  const threshold = LEVELS[level];

  function log(name, message, meta) {
    if (LEVELS[name] < threshold) return;
    const metaText = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(redact(meta))}` : '';
    write(`${now().toISOString()} ${name.toUpperCase().padEnd(5)} ${message}${metaText}`, name);
  }

  return {
    level,
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
  };
}

module.exports = { createLogger, consoleWriter, fileWriter, LEVELS };
