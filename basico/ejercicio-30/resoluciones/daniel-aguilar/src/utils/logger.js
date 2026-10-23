const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function createLogger({ level = 'info', write = (line, name) => (name === 'error' ? console.error : console.log)(line) } = {}) {
  const threshold = LEVELS[level];
  const log = (name, message, meta) => {
    if (LEVELS[name] < threshold) return;
    const extra = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    write(`${new Date().toISOString()} ${name.toUpperCase().padEnd(5)} ${message}${extra}`, name);
  };
  return {
    debug: (m, x) => log('debug', m, x),
    info: (m, x) => log('info', m, x),
    warn: (m, x) => log('warn', m, x),
    error: (m, x) => log('error', m, x),
  };
}

module.exports = { createLogger };
