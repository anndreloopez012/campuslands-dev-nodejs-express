export function loadConfig(environment = process.env) {
  const port = Number(environment.PORT ?? 3000);
  const shutdownTimeoutMs = Number(environment.SHUTDOWN_TIMEOUT_MS ?? 10000);
  const host = environment.HOST ?? '0.0.0.0';
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT debe ser un entero entre 1 y 65535');
  if (!Number.isInteger(shutdownTimeoutMs) || shutdownTimeoutMs < 1000 || shutdownTimeoutMs > 120000) throw new Error('SHUTDOWN_TIMEOUT_MS debe estar entre 1000 y 120000');
  if (typeof host !== 'string' || !host.trim()) throw new Error('HOST no puede estar vacío');
  return Object.freeze({ port, host, shutdownTimeoutMs });
}
