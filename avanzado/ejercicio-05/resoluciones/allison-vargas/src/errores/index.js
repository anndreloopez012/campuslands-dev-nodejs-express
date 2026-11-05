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
  JUGADOR_NO_ENCONTRADO: [404, (c) => `No existe el jugador ${c.jugadorId}`],
  CLUB_NO_ENCONTRADO: [404, (c) => `No existe el club ${c.clubId}`],
  FICHAJE_NO_ENCONTRADO: [404, (c) => `No existe el fichaje ${c.fichajeId}`],
  MISMO_CLUB: [422, (c) => `El jugador ${c.jugadorId} ya pertenece al club ${c.clubId}`],
  JUGADORES_DEL_MISMO_CLUB: [422, (c) => `Los jugadores ya pertenecen al mismo club (${c.clubId})`],
  MODALIDAD_DISTINTA: [422, (c) => `No se puede mover un jugador de ${c.jugador} a un club de ${c.club}`],
  PRECIO_BAJO_EL_MINIMO: [422, (c) => `El precio ${c.precio} no alcanza el minimo de ${c.minimo}`],
  PRESUPUESTO_INSUFICIENTE: [422, (c) => `El club ${c.clubId} necesita ${c.necesario} y solo dispone de ${c.disponible}`],
  COMPENSACION_INVALIDA: [422, (c) => `El club ${c.pagaClubId} no participa en este intercambio`],
  PLANTILLA_COMPLETA: [409, (c) => `La plantilla del club ${c.clubId} esta completa (${c.plantilla}/${c.maxima})`],
  PLANTILLA_MINIMA: [409, (c) => `El club ${c.clubId} no puede quedar con menos de ${c.minima} jugadores`],
  JUGADOR_RECIEN_FICHADO: [409, (c) => `El jugador ${c.jugadorId} fue movido hace poco y podra moverse desde ${c.disponibleDesde}`],
  IDEMPOTENCIA_CONFLICTO: [422, () => 'La clave de idempotencia ya se uso con una peticion distinta'],
  CONFLICTO_DE_VERSION: [409, (c) => `Otro cambio modifico ${c.coleccion}/${c.id} durante la transaccion`],
  TRANSACCION_EXPIRADA: [408, (c) => `La transaccion supero el tiempo maximo de ${c.maximoMs} ms`],
  FALLO_SIMULADO: [503, (c) => `Fallo simulado en el paso ${c.paso}`],
  VALIDACION: [400, () => 'Los datos enviados no son validos'],
  JSON_INVALIDO: [400, () => 'El body no es un JSON valido'],
  RUTA_NO_ENCONTRADA: [404, (c) => `Ruta no encontrada: ${c.metodo} ${c.ruta}`],
  METODO_NO_PERMITIDO: [405, (c) => `El metodo ${c.metodo} no esta permitido en esta ruta`],
  PAYLOAD_GRANDE: [413, () => 'El body supera el tamano permitido'],
  TIPO_NO_SOPORTADO: [415, () => 'El Content-Type debe ser application/json'],
  ERROR_INTERNO: [500, () => 'Error interno del servidor'],
};

export const CODIGOS_DE_INFRAESTRUCTURA = Object.freeze([
  'CONFLICTO_DE_VERSION',
  'TRANSACCION_EXPIRADA',
  'VALIDACION',
  'JSON_INVALIDO',
  'RUTA_NO_ENCONTRADA',
  'METODO_NO_PERMITIDO',
  'PAYLOAD_GRANDE',
  'TIPO_NO_SOPORTADO',
  'ERROR_INTERNO',
]);

export const CATALOGO = Object.freeze(Object.fromEntries(
  Object.entries(definiciones).map(([codigo, [status, mensaje]]) => [codigo, Object.freeze({ status, mensaje })]),
));

export function crear(codigo, contexto = {}, opciones = {}) {
  const definicion = CATALOGO[codigo];
  if (!definicion) throw new TypeError(`Codigo desconocido: ${codigo}`);
  return new ErrorDeNegocio(codigo, definicion.mensaje(contexto), definicion.status, { contexto, ...opciones });
}

export const esErrorDeNegocio = (valor) => valor instanceof ErrorDeNegocio;

export const esErrorDeRegla = (valor) =>
  esErrorDeNegocio(valor) && !CODIGOS_DE_INFRAESTRUCTURA.includes(valor.codigo);
