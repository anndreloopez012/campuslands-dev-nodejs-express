import { erroresBase } from './base.js';

export const definiciones = {
  ...erroresBase,
  LIBRO_NO_ENCONTRADO: [404, (c) => `No existe el libro ${c.libroId}`],
  PRESTAMO_NO_ENCONTRADO: [404, (c) => `No existe el prestamo ${c.prestamoId}`],
  SIN_EJEMPLARES: [409, (c) => `No quedan ejemplares disponibles de "${c.titulo}"`],
  LIMITE_DE_PRESTAMOS: [409, (c) => `${c.lector} ya tiene ${c.maximo} prestamos activos`],
  PRESTAMO_YA_DEVUELTO: [409, (c) => `El prestamo ${c.prestamoId} ya fue devuelto`],
};
