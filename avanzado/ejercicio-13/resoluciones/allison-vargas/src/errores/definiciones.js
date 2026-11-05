import { erroresBase } from './base.js';

export const definiciones = {
  ...erroresBase,
  NAVE_NO_ENCONTRADA: [404, (c) => `No existe la nave ${c.naveId}`],
  NAVE_NO_DISPONIBLE: [409, (c) => `La nave ${c.naveId} esta en ${c.estado} y no puede recibir misiones`],
  NAVE_OCUPADA: [409, (c) => `La nave ${c.naveId} ya tiene la mision ${c.misionId} en curso`],
  MISION_NO_ENCONTRADA: [404, (c) => `No existe la mision ${c.misionId}`],
  TRANSICION_INVALIDA: [409, (c) => `La mision ${c.misionId} esta ${c.estado} y no puede pasar a ${c.destino}`],
};
