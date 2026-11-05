export class ErrorHttp extends Error {
  constructor(codigo, mensaje, { detalles, cabeceras, causa } = {}) {
    super(mensaje, causa === undefined ? undefined : { cause: causa });
    this.name = this.constructor.name;
    this.codigo = codigo;
    this.detalles = detalles;
    this.cabeceras = cabeceras;
  }
}

export const CATALOGO_HTTP = Object.freeze({
  VALIDACION: Object.freeze({
    status: 400,
    titulo: 'Datos invalidos',
    sugerencia: 'Revisa la lista errores para corregir cada campo',
  }),
  JSON_INVALIDO: Object.freeze({
    status: 400,
    titulo: 'JSON invalido',
    sugerencia: 'Envia un body JSON bien formado',
  }),
  RUTA_NO_ENCONTRADA: Object.freeze({
    status: 404,
    titulo: 'Ruta no encontrada',
    sugerencia: 'Revisa la URL con la tabla de rutas del README',
  }),
  CODIGO_DESCONOCIDO: Object.freeze({
    status: 404,
    titulo: 'Codigo de error desconocido',
    sugerencia: 'Consulta GET /errores para ver los codigos existentes',
  }),
  METODO_NO_PERMITIDO: Object.freeze({
    status: 405,
    titulo: 'Metodo no permitido',
    sugerencia: 'Revisa la cabecera Allow de la respuesta',
  }),
  PAYLOAD_GRANDE: Object.freeze({
    status: 413,
    titulo: 'Body demasiado grande',
    sugerencia: 'Reduce el tamano del body a menos de 10kb',
  }),
  TIPO_NO_SOPORTADO: Object.freeze({
    status: 415,
    titulo: 'Tipo de contenido no soportado',
    sugerencia: 'Envia la cabecera Content-Type: application/json',
  }),
  ERROR_INTERNO: Object.freeze({
    status: 500,
    titulo: 'Error interno del servidor',
    sugerencia: 'Reporta el idPeticion al equipo de soporte',
  }),
});

export function crearHttp(codigo, mensaje, opciones) {
  if (!CATALOGO_HTTP[codigo]) throw new TypeError(`Codigo http desconocido: ${codigo}`);
  return new ErrorHttp(codigo, mensaje, opciones);
}
