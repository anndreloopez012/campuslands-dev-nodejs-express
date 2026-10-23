const entorno = process.env.NODE_ENV || 'development';

const configuraciones = {
  development: { appName: 'Battle Royale API (dev)', debug: true },
  production: { appName: 'Battle Royale API', debug: false },
  test: { appName: 'Battle Royale API (test)', debug: false }
};

const base = configuraciones[entorno] || configuraciones.development;

export const config = {
  entorno: entorno,
  port: Number(process.env.PORT) || 3000,
  appName: base.appName,
  debug: base.debug
};
