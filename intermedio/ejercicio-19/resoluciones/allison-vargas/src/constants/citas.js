export const TRANSICIONES = {
  pendiente: ['confirmada', 'cancelada'],
  confirmada: ['completada', 'cancelada'],
  completada: [],
  cancelada: [],
};

export const ESTADOS = Object.keys(TRANSICIONES);

export const ESTILOS = ['realismo', 'tradicional', 'linea fina', 'blackwork', 'acuarela', 'neotradicional'];
