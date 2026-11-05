export const ROLES = ['admin', 'recepcion', 'mecanico'];
export const ESTADOS_ORDEN = ['recibida', 'asignada', 'en_reparacion', 'lista', 'entregada', 'cancelada'];
export const ESTADOS_FINALES = ['entregada', 'cancelada'];
export const ESTADOS_DESTINO = ['en_reparacion', 'lista', 'entregada', 'cancelada'];

export const TRANSICIONES = {
  recibida: ['cancelada'],
  asignada: ['en_reparacion', 'cancelada'],
  en_reparacion: ['lista', 'cancelada'],
  lista: ['entregada'],
  entregada: [],
  cancelada: [],
};

export const QUIEN_CAMBIA = {
  en_reparacion: 'mecanico',
  lista: 'mecanico',
  entregada: 'recepcion',
  cancelada: 'recepcion',
};

export const TARIFA_HORA = 45;
export const HORAS_MAX_ORDEN = 100;
export const STOCK_BAJO = 5;
