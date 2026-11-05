import { config } from '../config/env.config.js';

export const getServerStatus = () => ({
  entorno: config.env,
  regionServidor: config.serverRegion,
  maxJugadoresPartida: config.maxPlayersPerMatch,
  tickRate: `${config.tickRateHz} Hz`,
  estado: 'En Línea y Operativo'
});
