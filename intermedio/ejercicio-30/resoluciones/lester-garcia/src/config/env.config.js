export const config = Object.freeze({
  server: Object.freeze({
    port: Number(process.env.PORT) || 3000,
    nodeEnv: (process.env.NODE_ENV || "development").trim(),
    apiVersion: (process.env.API_VERSION || "v1").trim()
  }),
  workshop: Object.freeze({
    name: (process.env.WORKSHOP_NAME || "Apex Moto Performance Garage").trim(),
    laborHourRateUsd: Number(process.env.LABOR_HOUR_RATE_USD) || 65,
    chiefMechanicApiKey: (process.env.CHIEF_MECHANIC_API_KEY || "moto_garage_master_key_2026").trim(),
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 30
  })
});
