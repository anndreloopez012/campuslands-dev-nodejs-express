import { createServer } from 'node:http';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
let ready = true;
const server = createServer(createApp({ isReady: () => ready }));
let shutdownStarted = false;

function log(event, details = {}) {
  process.stdout.write(`${JSON.stringify({ timestamp: new Date().toISOString(), event, ...details })}\n`);
}

function shutdown(signal) {
  if (shutdownStarted) return;
  shutdownStarted = true;
  ready = false;
  log('shutdown_started', { signal });
  const timeout = setTimeout(() => {
    log('shutdown_timeout');
    process.exit(1);
  }, config.shutdownTimeoutMs);
  timeout.unref();
  server.close((error) => {
    clearTimeout(timeout);
    if (error) {
      process.stderr.write(`${JSON.stringify({ event: 'shutdown_error', message: error.message })}\n`);
      process.exitCode = 1;
      return;
    }
    log('shutdown_complete');
  });
  server.closeIdleConnections?.();
}

server.listen(config.port, config.host, () => log('server_started', { host: config.host, port: config.port }));
server.on('error', (error) => {
  process.stderr.write(`${JSON.stringify({ event: 'server_error', message: error.message })}\n`);
  process.exitCode = 1;
});
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
