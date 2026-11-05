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
  PELICULA_NO_ENCONTRADA: [404, (c) => `No existe la pelicula ${c.peliculaId}`],
  PELICULA_DUPLICADA: [409, (c) => `Ya existe "${c.titulo}" del ${c.anio}`],
  EXPORTACION_NO_ENCONTRADA: [404, (c) => `No existe la exportacion ${c.exportacionId}`],
  EXPORTACION_LIMITE: [409, (c) => `Ya hay ${c.maximo} exportaciones guardadas; elimina alguna antes de crear otra`],
  EXPORTACION_DEMASIADO_GRANDE: [413, (c) => `La exportacion supera los ${c.maximoBytes} bytes permitidos para guardarla`],
  FORMATO_NO_SOPORTADO: [415, (c) => `El Content-Type debe ser ${c.esperado}`],
  VALIDACION: [400, () => 'Los datos enviados no son validos'],
  JSON_INVALIDO: [400, () => 'El body no es un JSON valido'],
  RUTA_NO_ENCONTRADA: [404, (c) => `Ruta no encontrada: ${c.metodo} ${c.ruta}`],
  METODO_NO_PERMITIDO: [405, (c) => `El metodo ${c.metodo} no esta permitido en esta ruta`],
  PAYLOAD_GRANDE: [413, () => 'El body supera el tamano permitido'],
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
