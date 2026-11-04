export const SERVICIOS = ['cambio de aceite', 'frenos', 'cadena', 'suspension', 'electrico', 'afinacion'];
export const ESTADOS_ORDEN = ['pendiente', 'en proceso', 'terminada', 'cancelada'];
export const PRIORIDADES = ['baja', 'normal', 'alta'];

export const ordenBody = {
  motoId: { type: 'integer', required: true, min: 1 },
  servicio: { type: 'enum', required: true, enum: SERVICIOS },
  descripcion: { type: 'string', max: 200 },
  costoEstimado: { type: 'number', required: true, min: 0, max: 100000 },
  prioridad: { type: 'enum', enum: PRIORIDADES, default: 'normal' },
};

export const ordenEstadoBody = {
  estado: { type: 'enum', required: true, enum: ESTADOS_ORDEN },
};

export const ordenQuery = {
  estado: { type: 'enum', enum: ESTADOS_ORDEN },
  motoId: { type: 'integer', coerce: true, min: 1 },
};
