export class ErrorDeNegocio extends Error {
  constructor(codigo, mensaje, status, { contexto = {}, detalles, cabeceras, causa } = {}) {
    super(mensaje, causa === undefined ? undefined : { cause: causa });
    this.name = 'ErrorDeNegocio';
    this.codigo = codigo;
    this.status = status;
    this.contexto = Object.freeze({ ...contexto });
    this.detalles = detalles;
    this.cabeceras = cabeceras;
  }
}

const definiciones = {
  PARTIDO_NO_ENCONTRADO: [404, (c) => `No existe el partido ${c.partidoId}`],
  JUGADOR_NO_ENCONTRADO: [404, (c) => `No hay partidos registrados de ${c.nombre}`],
  IMPORTACION_NO_ENCONTRADA: [404, (c) => `No existe la importacion ${c.importacionId}`],
  IMPORTACION_YA_REVERTIDA: [409, (c) => `La importacion ${c.importacionId} ya fue revertida`],
  FORMATO_NO_SOPORTADO: [415, (c) => `El Content-Type debe ser ${c.esperado}`],
  CODIFICACION_INVALIDA: [400, (c) => `El archivo no se puede leer como ${c.charset}; indica el charset correcto en el Content-Type`],
  CSV_VACIO: [422, () => 'El archivo no trae filas con datos'],
  CSV_MAL_FORMADO: [422, (c) => `CSV mal formado en la linea ${c.linea}: ${c.motivo}`],
  ENCABEZADOS_INVALIDOS: [422, () => 'Los encabezados del CSV no son validos'],
  LIMITE_DE_FILAS: [413, (c) => `El archivo supera el maximo de ${c.maximo} filas`],
  IMPORTACION_RECHAZADA: [422, (c) => `Modo estricto: ${c.rechazadas} de ${c.leidas} filas son invalidas y no se guardo nada`],
  VALIDACION: [400, () => 'Los datos enviados no son validos'],
  RUTA_NO_ENCONTRADA: [404, (c) => `Ruta no encontrada: ${c.metodo} ${c.ruta}`],
  METODO_NO_PERMITIDO: [405, (c) => `El metodo ${c.metodo} no esta permitido en esta ruta`],
  PAYLOAD_GRANDE: [413, () => 'El archivo supera el tamano permitido'],
  ERROR_INTERNO: [500, () => 'Error interno del servidor'],
};

export const CATALOGO = Object.freeze(Object.fromEntries(
  Object.entries(definiciones).map(([codigo, [status, mensaje]]) => [codigo, Object.freeze({ status, mensaje })]),
));

export function crear(codigo, contexto = {}, opciones = {}) {
  const definicion = CATALOGO[codigo];
  if (!definicion) throw new TypeError(`Codigo desconocido: ${codigo}`);
  return new ErrorDeNegocio(codigo, definicion.mensaje(contexto), definicion.status, { contexto, ...opciones });
}

export const esErrorDeNegocio = (valor) => valor instanceof ErrorDeNegocio;
