export const TOTAL_COMBATES = 20000;
export const CATEGORIAS = Object.freeze(['ligero', 'medio', 'pesado']);
export const METODOS = Object.freeze(['ko', 'tko', 'decision', 'descalificacion', 'empate']);
export const FORMATOS = Object.freeze(['ndjson', 'csv']);
export const MODOS = Object.freeze(['permisivo', 'estricto']);
export const COLUMNAS = Object.freeze([
  'id', 'fecha', 'categoria', 'rojoId', 'azulId', 'ganadorId', 'metodo', 'rounds', 'golpesRojo', 'golpesAzul',
]);

export const LIMITES = Object.freeze({
  importacionBytes: 1024 * 1024,
  lineaCaracteres: 2048,
  erroresReportados: 20,
  descarteBytes: 4 * 1024 * 1024,
  exportacionMaxima: 50000,
  bufferDeObjetos: 16,
});
