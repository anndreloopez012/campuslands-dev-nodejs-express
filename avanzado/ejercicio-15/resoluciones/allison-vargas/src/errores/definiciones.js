import { erroresBase } from './base.js';

export const definiciones = {
  ...erroresBase,
  ORIGEN_NO_PERMITIDO: [403, (c) => `El origen ${c.origen} no esta autorizado`],
  PREFLIGHT_RECHAZADO: [403, (c) => `CORS no permite ${c.metodo}${c.cabeceras ? ` con cabeceras ${c.cabeceras}` : ''}`],
  PUESTO_NO_ENCONTRADO: [404, (c) => `No existe el puesto ${c.puestoId}`],
  PEDIDO_NO_ENCONTRADO: [404, (c) => `No existe el pedido ${c.pedidoId}`],
};
