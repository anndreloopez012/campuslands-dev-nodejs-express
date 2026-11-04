export const TRANSICIONES = {
  pendiente: ['preparando', 'cancelado'],
  preparando: ['listo'],
  listo: ['entregado'],
  entregado: [],
  cancelado: [],
};

export const ESTADOS = Object.keys(TRANSICIONES);
