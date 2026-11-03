import dotenv from 'dotenv';

// Carga las variables del archivo .env al objeto process.env
dotenv.config();

export const envs = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_KEY: process.env.API_KEY || 'default_key',
    SPEED_LIMIT_FILTER: parseInt(process.env.SPEED_LIMIT_FILTER || '0')
};