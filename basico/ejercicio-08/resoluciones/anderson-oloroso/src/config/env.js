// Módulo de configuración segura de variables de entorno con fallbacks
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  pista: process.env.TELEMETRY_PISTA || 'Nürburgring Nordschleife',
  limiteVelocidadKmH: process.env.MAX_SPEED_LIMIT_KMH ? Number(process.env.MAX_SPEED_LIMIT_KMH) : 500,
  debug: process.env.DEBUG_TELEMETRY === 'true'
};

export function validateConfig() {
  if (isNaN(config.port) || config.port < 1024 || config.port > 65535) {
    throw new Error(`Puerto inválido en variable PORT: ${process.env.PORT}. Debe ser entre 1024 y 65535.`);
  }

  if (isNaN(config.limiteVelocidadKmH) || config.limiteVelocidadKmH <= 0) {
    throw new Error('El límite de velocidad debe ser un valor numérico positivo.');
  }

  return config;
}
