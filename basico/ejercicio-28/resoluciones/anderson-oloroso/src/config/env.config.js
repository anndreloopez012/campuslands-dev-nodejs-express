export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  serverRegion: process.env.BR_REGION || 'SA-East (São Paulo)',
  maxPlayersPerMatch: Number(process.env.BR_MAX_PLAYERS) || 100,
  tickRateHz: Number(process.env.BR_TICKRATE) || 64
};
