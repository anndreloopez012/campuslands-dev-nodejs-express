import 'dotenv/config';

// Valores por defecto para desarrollo; en producción se definen en .env
export const config = {
  port: Number(process.env.PORT) || 3000,
  studioName: process.env.STUDIO_NAME || 'Estudio Demo',
  maxResults: Number(process.env.MAX_RESULTS) || 10,
  apiKey: process.env.API_KEY
};

// Falla rápido si falta una variable obligatoria
if (!config.apiKey) {
  throw new Error('Falta la variable de entorno API_KEY. Copia .example.env a .env');
}
