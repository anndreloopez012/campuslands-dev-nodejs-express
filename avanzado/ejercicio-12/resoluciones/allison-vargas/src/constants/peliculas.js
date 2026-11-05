export const SUBGENEROS = Object.freeze(['slasher', 'sobrenatural', 'gore', 'psicologico', 'found-footage', 'zombis', 'monstruos', 'gotico']);
export const CLASIFICACIONES = Object.freeze(['+13', '+16', '+18']);
export const FORMAS = Object.freeze(['arreglo', 'envoltorio', 'ndjson']);
export const COMPRESIONES = Object.freeze(['auto', 'ninguna']);
export const INCLUIBLES = Object.freeze(['director', 'reparto', 'ganancia']);
export const CAMPOS_ORDENABLES = Object.freeze(['id', 'titulo', 'anio', 'calificacion', 'duracionMin', 'presupuestoMusd', 'recaudacionMusd']);

export const CAMPOS_BASE = Object.freeze({
  id: { type: 'integer' },
  titulo: { type: 'string' },
  anio: { type: 'integer' },
  subgenero: { type: 'string', enum: SUBGENEROS },
  duracionMin: { type: 'integer' },
  clasificacion: { type: 'string', enum: CLASIFICACIONES },
  calificacion: { type: 'number', minimum: 0, maximum: 10 },
  presupuestoMusd: { type: 'number', minimum: 0 },
  recaudacionMusd: { type: 'number', minimum: 0 },
  estreno: { type: 'string', format: 'date' },
  pais: { type: 'string' },
  sinopsis: { type: 'string' },
  etiquetas: { type: 'array', items: { type: 'string' } },
  directorId: { type: 'integer' },
  repartoIds: { type: 'array', items: { type: 'integer' } },
});

export const CAMPOS_INCLUIDOS = Object.freeze({
  director: {
    type: 'object',
    properties: { id: { type: 'integer' }, nombre: { type: 'string' }, pais: { type: 'string' } },
    required: ['id', 'nombre', 'pais'],
    additionalProperties: false,
  },
  reparto: {
    type: 'array',
    items: {
      type: 'object',
      properties: { id: { type: 'integer' }, nombre: { type: 'string' } },
      required: ['id', 'nombre'],
      additionalProperties: false,
    },
  },
  ganancia: { type: 'number' },
});

export const LIMITES = Object.freeze({
  maxRegistrosExportables: 100000,
  maxCampos: 20,
  bytesInstantanea: 5 * 1024 * 1024,
  instantaneas: 20,
  filasPorTrozo: 100,
  nombreInstantanea: 60,
});
