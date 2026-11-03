import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const rawConfig = {
  server: Object.freeze({
    port: parseNumber(process.env.PORT, 3000),
    nodeEnv: (process.env.NODE_ENV || "development").trim(),
    apiVersion: (process.env.API_VERSION || "v1").trim()
  }),
  studio: Object.freeze({
    name: (process.env.STUDIO_NAME || "Black Ink Tattoo Studio").trim(),
    hourlyRateUsd: parseNumber(process.env.HOURLY_RATE_USD, 120),
    depositPercentage: parseNumber(process.env.DEPOSIT_PERCENTAGE, 30),
    minAgeRequired: parseNumber(process.env.MIN_AGE_REQUIRED, 18),
    maxSessionHours: parseNumber(process.env.MAX_SESSION_HOURS, 8),
    allowedStyles: Object.freeze([
      "Tradicional",
      "Neotradicional",
      "Realismo Sombras",
      "Blackwork",
      "Fine Line",
      "Japones Irezumi"
    ])
  })
};

export const config = Object.freeze(rawConfig);
