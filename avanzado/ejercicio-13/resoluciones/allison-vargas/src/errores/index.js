import { definiciones } from './definiciones.js';

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

export const CATALOGO = Object.freeze(Object.fromEntries(
  Object.entries(definiciones).map(([codigo, [status, mensaje]]) => [codigo, Object.freeze({ status, mensaje })]),
));

export function crear(codigo, contexto = {}, opciones = {}) {
  const definicion = CATALOGO[codigo];
  if (!definicion) throw new TypeError(`Codigo desconocido: ${codigo}`);
  return new ErrorDeNegocio(codigo, definicion.mensaje(contexto), definicion.status, { contexto, ...opciones });
}

export const esErrorDeNegocio = (valor) => valor instanceof ErrorDeNegocio;
