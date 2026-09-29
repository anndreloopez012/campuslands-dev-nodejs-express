const ENVIRONMENTS = {
  development: { logLevel: "verbose", maxLobbySize: 4, exposeDebugRoutes: true },
  production: { logLevel: "error", maxLobbySize: 100, exposeDebugRoutes: false },
  test: { logLevel: "silent", maxLobbySize: 2, exposeDebugRoutes: false },
};

const env = process.env.NODE_ENV || "development";
const envConfig = ENVIRONMENTS[env];

if (!envConfig) {
  throw new Error(`NODE_ENV="${env}" no es un entorno soportado (development, production, test)`);
}

const config = {
  env,
  port: Number(process.env.PORT) || 3028,
  ...envConfig,
};

export default config;
