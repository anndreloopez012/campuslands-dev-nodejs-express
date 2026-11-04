export const TRANSICIONES_TOUR = {
  borrador: ['publicado'],
  publicado: ['cerrado'],
  cerrado: [],
};

export const TRANSICIONES_RESERVA = {
  pendiente: ['confirmada', 'cancelada'],
  confirmada: ['cancelada'],
  cancelada: [],
};

export const ESTADOS_TOUR = Object.keys(TRANSICIONES_TOUR);
export const ESTADOS_RESERVA = Object.keys(TRANSICIONES_RESERVA);
