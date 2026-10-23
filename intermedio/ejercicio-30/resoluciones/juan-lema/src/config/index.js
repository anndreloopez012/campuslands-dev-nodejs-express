import dotenv from "dotenv";

const readString = (name, fallback) => process.env[name]?.trim() || fallback;

function readNumber(name, fallback, { min = -Infinity, max = Infinity } = {}) {
  const raw = readString(name);
  if (raw === undefined) return fallback;

  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`Variable de entorno ${name} invalida: "${raw}"`);
  return value;
}

function loadConfig() {
  dotenv.config({ quiet: true });

  const env = readString("NODE_ENV", "development");
  if (!["development", "production", "test"].includes(env)) throw new Error(`Variable de entorno NODE_ENV invalida: "${env}"`);

  const jwtSecret = readString("JWT_SECRET", env === "production" ? undefined : "dev-secret-change-me");
  if (!jwtSecret) throw new Error("Variable de entorno JWT_SECRET es obligatoria en produccion");

  return Object.freeze({
    env,
    port: readNumber("PORT", 4030, { min: 0, max: 65535 }),
    jwtSecret,
    jwtExpiresIn: readString("JWT_EXPIRES_IN", "15m"),
  });
}

export { loadConfig };
