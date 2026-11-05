export const MODALIDADES = Object.freeze(['futbol', 'futsal']);

export const COMISION_AGENTE = 0.05;
export const VENTANA_DIAS = 30;
export const MS_POR_DIA = 24 * 60 * 60 * 1000;

export const PASOS_FICHAJE = Object.freeze([
  'validado',
  'debitado',
  'acreditado',
  'comision',
  'movido',
  'plantillas',
  'registrado',
]);

export const PASOS_INTERCAMBIO = Object.freeze([
  'validado',
  'compensado',
  'movidoA',
  'movidoB',
  'registrado',
]);

export const PRECIO_MAXIMO = 1000000;
export const SALARIO_MAXIMO = 100000;
export const CAPACIDAD_DIARIO = 200;
export const TIEMPO_MAXIMO_MS = 5000;
export const REINTENTOS = 3;
