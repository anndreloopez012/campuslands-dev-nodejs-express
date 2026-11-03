export const envConfig = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  apiSecretKey: process.env.API_SECRET_KEY || "default_secret_key"
};