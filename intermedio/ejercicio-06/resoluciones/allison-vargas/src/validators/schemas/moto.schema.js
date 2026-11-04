export const ESTADOS_MOTO = ['activa', 'en taller', 'vendida'];

const anioMaximo = () => new Date().getFullYear() + 1;

export const motoBody = {
  marca: { type: 'string', required: true, min: 2, max: 30 },
  modelo: { type: 'string', required: true, min: 1, max: 40 },
  anio: { type: 'integer', required: true, min: 1950, max: anioMaximo },
  cilindraje: { type: 'integer', required: true, min: 50, max: 2500 },
  placa: {
    type: 'string',
    required: true,
    mayusculas: true,
    pattern: /^M\d{3}[A-Z]{3}$/,
    mensajePattern: 'placa debe tener el formato M123ABC',
  },
  estado: { type: 'enum', enum: ESTADOS_MOTO, default: 'activa' },
};

export const motoQuery = {
  marca: { type: 'string', min: 2, max: 30 },
  estado: { type: 'enum', enum: ESTADOS_MOTO },
  anioDesde: { type: 'integer', coerce: true, min: 1950, max: anioMaximo },
};
