import { ErrorApp } from '../utils/error-app.js';

const naves = [
  { id: 1, nombre: 'Nostromo', tripulacion: 7 },
  { id: 2, nombre: 'Enterprise', tripulacion: 430 },
  { id: 3, nombre: 'Halcon Milenario', tripulacion: 2 }
];

export function buscarNave(id) {
  if (Number.isNaN(id)) {
    throw new ErrorApp('El id debe ser un numero', 400);
  }

  const nave = naves.find((n) => n.id === id);

  if (!nave) {
    throw new ErrorApp('Nave no encontrada', 404);
  }

  return nave;
}

export function convertirTexto(texto) {
  if (!texto) {
    throw new ErrorApp('Falta el parametro texto', 400);
  }

  try {
    return JSON.parse(texto);
  } catch (error) {
    throw new ErrorApp('El texto no es un JSON valido', 400);
  }
}
