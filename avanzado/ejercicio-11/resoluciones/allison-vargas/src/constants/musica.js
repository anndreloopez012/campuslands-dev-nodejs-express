export const GENEROS = Object.freeze(['rock', 'pop', 'jazz', 'clasica', 'electronica', 'hiphop', 'folk', 'latina', 'metal']);
export const CONFLICTOS = Object.freeze(['omitir', 'actualizar', 'fallar']);
export const MODOS = Object.freeze(['permisivo', 'todo-o-nada']);
export const ESTADOS = Object.freeze(['en_cola', 'procesando', 'completada', 'fallida', 'cancelada']);
export const TERMINALES = Object.freeze(['completada', 'fallida', 'cancelada']);
export const FORMATOS_RECHAZOS = Object.freeze(['ndjson', 'csv']);

export const TIPOS_ACEPTADOS = Object.freeze(['application/json', 'application/x-ndjson']);

export const LIMITES = Object.freeze({
  filas: 5000,
  loteMinimo: 1,
  loteMaximo: 500,
  loteDefecto: 100,
  rechazosGuardados: 1000,
  pendientesEnCola: 10,
  reintentoSegundos: 5,
  bytes: '2mb',
});

export const CAMPOS_COMPARABLES = Object.freeze(['titulo', 'artista', 'album', 'anio', 'duracionSeg', 'genero', 'explicito']);
