import { config } from '../config/index.js';

const enmascarar = (secreto) => `${secreto.slice(0, 3)}${'*'.repeat(Math.max(secreto.length - 3, 5))}`;

export const publica = () => ({
  app: config.nombreApp,
  entorno: config.entorno,
  estudio: config.estudio,
});

export const completa = () => ({
  app: config.nombreApp,
  entorno: config.entorno,
  puerto: config.puerto,
  nivelLog: config.nivelLog,
  apiKey: enmascarar(config.apiKey),
  estudio: config.estudio,
  origenes: config.origenes,
  archivoEnvCargado: config.hayArchivoEnv,
});
