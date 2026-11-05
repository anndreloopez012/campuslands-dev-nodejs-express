export const config = {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  studioName: process.env.STUDIO_NAME || 'Black Lotus Tattoo Studio',
  tarifaHoraUSD: Number(process.env.STUDIO_HOURLY_RATE) || 80,
  hasApiKey: Boolean(process.env.STUDIO_API_KEY)
};
