import dotenv from 'dotenv';

dotenv.config();

const variablesRequeridas = ['PORT', 'MARCA_DESTACADA', 'LIMITE_VELOCIDAD_KMH'];

for (const variable of variablesRequeridas) {
  if (!process.env[variable]) {
    throw new Error(
      `Falta la variable de entorno "${variable}". Copia .env.example a .env y completa los valores.`
    );
  }
}

export const env = {
  PORT: Number(process.env.PORT),
  MARCA_DESTACADA: process.env.MARCA_DESTACADA,
  LIMITE_VELOCIDAD_KMH: Number(process.env.LIMITE_VELOCIDAD_KMH),
};
