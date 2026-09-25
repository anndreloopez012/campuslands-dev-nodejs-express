const ENVIRONMENTS = {
  development: { logLevel: "verbose" },
  production: { logLevel: "error" },
  test: { logLevel: "silent" },
};

const env = process.env.NODE_ENV || "development";
const envConfig = ENVIRONMENTS[env];

if (!envConfig) {
  throw new Error(`NODE_ENV="${env}" no es un entorno soportado (development, production, test)`);
}

const config = {
  env,
  port: Number(process.env.PORT) || 3030,
  ...envConfig,
};

export default config;
