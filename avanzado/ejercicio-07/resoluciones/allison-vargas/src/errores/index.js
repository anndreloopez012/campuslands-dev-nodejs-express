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
  AUTO_NO_ENCONTRADO: [404, (c) => `No existe el auto ${c.autoId}`],
  MARCA_NO_ENCONTRADA: [404, (c) => `No hay autos de la marca ${c.marca}`],
  CLAVE_NO_ENCONTRADA: [404, (c) => `No hay nada en cache con la clave ${c.clave}`],
  VIN_DUPLICADO: [409, (c) => `Ya existe un auto con el VIN ${c.vin}`],
  RELOJ_REAL: [409, () => 'El reloj virtual no esta activado; inicia el servidor con RELOJ_VIRTUAL=true'],
  VALIDACION: [400, () => 'Los datos enviados no son validos'],
  JSON_INVALIDO: [400, () => 'El body no es un JSON valido'],
  RUTA_NO_ENCONTRADA: [404, (c) => `Ruta no encontrada: ${c.metodo} ${c.ruta}`],
  METODO_NO_PERMITIDO: [405, (c) => `El metodo ${c.metodo} no esta permitido en esta ruta`],
  PAYLOAD_GRANDE: [413, () => 'El body supera el tamano permitido'],
  TIPO_NO_SOPORTADO: [415, () => 'El Content-Type debe ser application/json'],
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
