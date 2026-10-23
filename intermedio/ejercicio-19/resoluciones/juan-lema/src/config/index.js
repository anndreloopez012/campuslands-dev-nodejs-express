import dotenv from "dotenv";

dotenv.config({ quiet: true });

const readString = (name, fallback) => process.env[name]?.trim() || fallback;

function readNumber(name, fallback, { min = -Infinity, max = Infinity } = {}) {
  const raw = readString(name);
  if (raw === undefined) return fallback;

  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`Variable de entorno ${name} invalida: "${raw}"`);
  return value;
}

function readEnum(name, allowed, fallback) {
  const value = readString(name, fallback);
  if (!allowed.includes(value)) throw new Error(`Variable de entorno ${name} invalida: "${value}". Valores permitidos: ${allowed.join(", ")}`);
  return value;
}

function loadConfig() {
  const env = readEnum("NODE_ENV", ["development", "production", "test"], "development");
  const adminApiKey = readString("ADMIN_API_KEY", env === "production" ? undefined : "dev-admin-key");
  if (!adminApiKey) throw new Error("Variable de entorno ADMIN_API_KEY es obligatoria en produccion");

  const publicConfig = Object.freeze({
    env,
    studio: Object.freeze({ name: readString("STUDIO_NAME", "Tinta Viva Studio"), currency: readString("CURRENCY", "USD") }),
    pricing: Object.freeze({ hourlyRate: readNumber("HOURLY_RATE", 80, { min: 1 }), depositPercent: readNumber("DEPOSIT_PERCENT", 30, { min: 0, max: 100 }) }),
    booking: Object.freeze({ maxSessionHours: readNumber("MAX_SESSION_HOURS", 6, { min: 0.5 }) }),
  });

  return { publicConfig, config: Object.freeze({ ...publicConfig, port: readNumber("PORT", 4019, { min: 0, max: 65535 }), adminApiKey }) };
}

let loaded;

try {
  loaded = loadConfig();
} catch (error) {
  console.error(`No se pudo iniciar: ${error.message}`);
  process.exit(1);
}

export const { config, publicConfig } = loaded;
