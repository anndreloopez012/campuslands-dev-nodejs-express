import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 3000,
  studioName: process.env.STUDIO_NAME || 'Estudio de tatuajes'
};
