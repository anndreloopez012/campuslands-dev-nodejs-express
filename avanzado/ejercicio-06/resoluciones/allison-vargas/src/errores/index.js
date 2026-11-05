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
  TRABAJO_NO_ENCONTRADO: [404, (c) => `No existe el trabajo ${c.trabajoId}`],
  ORDEN_NO_ENCONTRADA: [404, (c) => `No existe la orden ${c.ordenId}`],
  TRABAJADOR_NO_ENCONTRADO: [404, (c) => `No existe el mecanico ${c.trabajadorId}`],
  DEPENDENCIA_NO_ENCONTRADA: [422, (c) => `La dependencia ${c.trabajoId} no existe`],
  DEPENDENCIA_FALLIDA: [422, (c) => `La dependencia ${c.trabajoId} esta ${c.estado} y no se puede esperar`],
  TOKEN_INVALIDO: [409, (c) => `El token no corresponde a la reclamacion vigente del trabajo ${c.trabajoId}`],
  TRABAJO_NO_EN_PROCESO: [409, (c) => `El trabajo ${c.trabajoId} esta ${c.estado}, no en proceso`],
  EXTENSIONES_AGOTADAS: [409, (c) => `El trabajo ${c.trabajoId} ya uso sus ${c.maximo} extensiones`],
  TRABAJO_EN_PROCESO: [409, (c) => `El trabajo ${c.trabajoId} esta en proceso y no se puede cancelar`],
  TRABAJO_FINALIZADO: [409, (c) => `El trabajo ${c.trabajoId} ya termino (${c.estado})`],
  TRABAJO_NO_MUERTO: [409, (c) => `Solo se reencolan trabajos muertos y el ${c.trabajoId} esta ${c.estado}`],
  TRABAJADOR_OCUPADO: [409, (c) => `El mecanico ${c.trabajadorId} ya tiene ${c.ocupados} de ${c.capacidad} trabajos`],
  RELOJ_REAL: [409, () => 'El reloj virtual no esta activado; inicia el servidor con RELOJ_VIRTUAL=true'],
  SIMULACION_DESHABILITADA: [403, () => 'Las simulaciones de fallo estan deshabilitadas'],
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
