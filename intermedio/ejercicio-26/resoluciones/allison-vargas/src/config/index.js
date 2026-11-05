export function leerConfig(env = process.env) {
  const timeoutMs = env.ANTICHEAT_TIMEOUT_MS === undefined ? 2000 : Number(env.ANTICHEAT_TIMEOUT_MS);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 10000) {
    throw new Error('ANTICHEAT_TIMEOUT_MS debe ser un entero entre 100 y 10000');
  }

  return {
    anticheatUrl: env.ANTICHEAT_URL || null,
    anticheatTimeoutMs: timeoutMs,
    webhookUrl: env.WEBHOOK_URL || null,
  };
}
