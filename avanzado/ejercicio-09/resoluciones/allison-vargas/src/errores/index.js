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
  COMBATE_NO_ENCONTRADO: [404, (c) => `No existe el combate ${c.combateId}`],
  PELEADOR_NO_ENCONTRADO: [404, (c) => `No existe el peleador ${c.peleadorId}`],
  FORMATO_NO_SOPORTADO: [415, (c) => `El Content-Type debe ser ${c.esperado}`],
  IMPORTACION_VACIA: [422, () => 'El archivo no trae ninguna linea con datos'],
  IMPORTACION_RECHAZADA: [422, (c) => `Modo estricto: ${c.rechazadas} de ${c.recibidas} lineas son invalidas y no se guardo nada`],
  LINEA_DEMASIADO_LARGA: [413, (c) => `La linea ${c.linea} supera los ${c.maximo} caracteres`],
  CARGA_INTERRUMPIDA: [400, () => 'La conexion se cerro antes de terminar de recibir el archivo'],
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
