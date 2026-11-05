import { erroresBase } from './base.js';

export const definiciones = {
  ...erroresBase,
  NO_AUTENTICADO: [401, () => 'Falta un token valido (Authorization: Bearer ...)'],
  PROHIBIDO: [403, (c) => `No puedes ${c.accion}: ${c.motivo}`],
  SALTO_NO_ENCONTRADO: [404, (c) => `No existe el salto ${c.saltoId}`],
  VUELO_NO_ENCONTRADO: [404, (c) => `No existe el vuelo ${c.vueloId}`],
  VUELO_LLENO: [409, (c) => `El vuelo ${c.vueloId} ya tiene ${c.capacidad} saltadores`],
  VUELO_NO_DISPONIBLE: [409, (c) => `El vuelo ${c.vueloId} esta ${c.estado}`],
  VUELO_CON_PENDIENTES: [409, (c) => `El vuelo ${c.vueloId} tiene ${c.pendientes} saltos sin aprobar`],
  SALTO_YA_RESUELTO: [409, (c) => `El salto ${c.saltoId} ya esta ${c.estado}`],
  SALTO_DUPLICADO: [409, (c) => `Ya estas en el manifiesto del vuelo ${c.vueloId}`],
};
