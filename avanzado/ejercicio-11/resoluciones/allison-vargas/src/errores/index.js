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
  CANCION_NO_ENCONTRADA: [404, (c) => `No existe la cancion con ISRC ${c.isrc}`],
  IMPORTACION_NO_ENCONTRADA: [404, (c) => `No existe la importacion ${c.importacionId}`],
  IMPORTACION_FINALIZADA: [409, (c) => `La importacion ${c.importacionId} ya termino (${c.estado}) y no se puede cancelar`],
  IMPORTACION_NO_REVERTIBLE: [409, (c) => `La importacion ${c.importacionId} no se puede revertir: ${c.motivo}`],
  CLAVE_DE_IDEMPOTENCIA_REUTILIZADA: [409, () => 'Esa Idempotency-Key ya se uso con un contenido distinto'],
  COLA_LLENA: [429, () => 'Hay demasiadas importaciones esperando; intenta de nuevo en unos segundos'],
  IMPORTACION_VACIA: [422, () => 'La importacion no trae ninguna cancion'],
  IMPORTACION_DEMASIADO_GRANDE: [413, (c) => `Una importacion admite como maximo ${c.maximo} canciones`],
  FORMATO_NO_SOPORTADO: [415, (c) => `El Content-Type debe ser ${c.esperado}`],
  CODIFICACION_INVALIDA: [400, () => 'El archivo no es UTF-8 valido'],
  VALIDACION: [400, () => 'Los datos enviados no son validos'],
  JSON_INVALIDO: [400, () => 'El body no es un JSON valido'],
  RUTA_NO_ENCONTRADA: [404, (c) => `Ruta no encontrada: ${c.metodo} ${c.ruta}`],
  METODO_NO_PERMITIDO: [405, (c) => `El metodo ${c.metodo} no esta permitido en esta ruta`],
  PAYLOAD_GRANDE: [413, () => 'El contenido supera el tamano permitido'],
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
