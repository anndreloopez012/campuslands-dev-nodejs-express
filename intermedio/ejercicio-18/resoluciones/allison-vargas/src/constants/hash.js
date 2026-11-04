export const PARAMETROS = {
  algoritmo: 'scrypt',
  N: 16384,
  r: 8,
  p: 1,
  longitudClave: 32,
  longitudSal: 16,
};

export const LIMITES = {
  N: { min: 1024, max: 65536 },
  r: { min: 1, max: 16 },
  p: { min: 1, max: 4 },
  longitudClave: { min: 16, max: 64 },
  longitudSal: { min: 8, max: 64 },
};

export const MEMORIA_MAXIMA = 128 * 1024 * 1024;
