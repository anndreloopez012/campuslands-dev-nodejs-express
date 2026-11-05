export const DELIMITADORES = Object.freeze({
  coma: ',',
  puntoycoma: ';',
  tabulador: '\t',
  barra: '|',
});

export const CANDIDATOS = Object.freeze([',', ';', '\t', '|']);
export const OPCIONES_DELIMITADOR = Object.freeze(['auto', ...Object.keys(DELIMITADORES)]);
export const MODOS = Object.freeze(['permisivo', 'estricto']);
export const FORMATOS_PARTIDO = Object.freeze([3, 5, 7]);

export const LIMITES = Object.freeze({
  bytes: 1024 * 1024,
  registros: 5001,
  campoCaracteres: 200,
  erroresReportados: 50,
  vistaPrevia: 5,
  muestraDelimitador: 20,
});

export const CHARSETS = Object.freeze({
  'utf-8': 'utf-8',
  utf8: 'utf-8',
  'iso-8859-1': 'iso-8859-1',
  latin1: 'iso-8859-1',
  'windows-1252': 'windows-1252',
});

export const COLUMNAS = Object.freeze([
  'id', 'fecha', 'torneo', 'mesa', 'local', 'visita', 'mejorDe', 'setsLocal', 'setsVisita', 'puntosLocal', 'puntosVisita',
]);

export const ALIAS_ENCABEZADOS = Object.freeze({
  fecha: ['fecha', 'date'],
  torneo: ['torneo', 'campeonato'],
  mesa: ['mesa'],
  local: ['local', 'jugadorlocal', 'jugador1'],
  visita: ['visita', 'visitante', 'jugadorvisita', 'jugador2'],
  mejorDe: ['mejorde', 'formato'],
  setsLocal: ['setslocal', 'setsganadoslocal'],
  setsVisita: ['setsvisita', 'setsvisitante', 'setsganadosvisita'],
  puntosLocal: ['puntoslocal'],
  puntosVisita: ['puntosvisita', 'puntosvisitante'],
});

export const OBLIGATORIAS = Object.freeze(['fecha', 'local', 'visita', 'setsLocal', 'setsVisita']);
