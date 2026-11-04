export const TRANSICIONES = {
  pendiente: ['pagado', 'cancelado'],
  pagado: ['enviado', 'cancelado'],
  enviado: [],
  cancelado: [],
};

export const ESTADOS = Object.keys(TRANSICIONES);
