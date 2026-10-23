import development from './environments/development.js';
import production from './environments/production.js';
import test from './environments/test.js';

const ENTORNOS = { development, production, test };

const NODE_ENV = process.env.NODE_ENV || 'development';
const configEntorno = ENTORNOS[NODE_ENV];

if (!configEntorno) {
  throw new Error(
    `NODE_ENV="${NODE_ENV}" no es valido. Usa uno de: ${Object.keys(ENTORNOS).join(', ')}`
  );
}

export const config = {
  entorno: NODE_ENV,
  puerto: process.env.PORT || 3000,
  ...configEntorno,
};
