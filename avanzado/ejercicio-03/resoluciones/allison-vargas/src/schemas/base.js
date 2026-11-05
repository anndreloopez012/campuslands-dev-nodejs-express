import { ValidationError } from '../utils/errors.js';

export const INVALIDO = Symbol('invalido');

export function nombreDeTipo(valor) {
  if (valor === null) return 'nulo';
  if (Array.isArray(valor)) return 'arreglo';
  switch (typeof valor) {
    case 'string':
      return 'texto';
    case 'number':
      return Number.isFinite(valor) ? 'numero' : 'numero no finito';
    case 'boolean':
      return 'booleano';
    case 'object':
      return 'objeto';
    default:
      return typeof valor;
  }
}

export function formatearRuta(segmentos) {
  if (!segmentos.length) return '$';
  let ruta = '';
  for (const segmento of segmentos) {
    if (typeof segmento === 'number') ruta += `[${segmento}]`;
    else ruta += ruta ? `.${segmento}` : segmento;
  }
  return ruta;
}

const aSegmentos = (ruta) => (Array.isArray(ruta) ? ruta : String(ruta ?? '').split('.').filter(Boolean));

export function crearContexto() {
  const incidencias = [];
  return {
    incidencias,
    informar(ruta, codigo, mensaje) {
      incidencias.push({ ruta: [...ruta], codigo, mensaje });
    },
  };
}

export class Esquema {
  etiqueta = 'un valor';

  constructor(def = {}) {
    this.def = Object.freeze({
      opcional: false,
      nulo: false,
      tieneDefecto: false,
      defecto: undefined,
      verificaciones: [],
      transformaciones: [],
      reglas: [],
      descripcion: undefined,
      ...def,
    });
  }

  _con(cambios) {
    return new this.constructor({ ...this.def, ...cambios });
  }

  opcional() {
    return this._con({ opcional: true });
  }

  nulo() {
    return this._con({ nulo: true });
  }

  defecto(valor) {
    return this._con({ tieneDefecto: true, defecto: valor });
  }

  sinDefecto() {
    return this._con({ tieneDefecto: false, defecto: undefined });
  }

  describir(descripcion) {
    return this._con({ descripcion });
  }

  transformar(funcion) {
    return this._con({ transformaciones: [...this.def.transformaciones, funcion] });
  }

  verificar(funcion, descripcion) {
    return this._con({
      verificaciones: [...this.def.verificaciones, funcion],
      reglas: descripcion ? [...this.def.reglas, descripcion] : this.def.reglas,
    });
  }

  refinar(predicado, { codigo = 'personalizado', mensaje = 'no cumple una regla', ruta = [], descripcion } = {}) {
    return this.verificar((valor, informar) => {
      if (!predicado(valor)) informar({ codigo, mensaje, ruta });
    }, descripcion);
  }

  tipoInvalido(valor, ruta, ctx) {
    ctx.informar(ruta, 'tipo_invalido', `debe ser ${this.etiqueta}, se recibio ${nombreDeTipo(valor)}`);
    return INVALIDO;
  }

  ejecutar(valor, ruta, ctx) {
    const { def } = this;
    if (valor === undefined) {
      if (def.tieneDefecto) return structuredClone(def.defecto);
      if (def.opcional) return undefined;
      ctx.informar(ruta, 'requerido', 'es obligatorio');
      return INVALIDO;
    }
    if (valor === null) {
      if (def.nulo) return null;
      ctx.informar(ruta, 'nulo_no_permitido', 'no puede ser nulo');
      return INVALIDO;
    }

    const base = this.analizar(valor, ruta, ctx);
    if (base === INVALIDO) return INVALIDO;

    let correcto = true;
    for (const verificacion of def.verificaciones) {
      verificacion(base, (incidencia) => {
        correcto = false;
        ctx.informar(
          [...ruta, ...aSegmentos(incidencia.ruta)],
          incidencia.codigo ?? 'personalizado',
          incidencia.mensaje ?? 'no cumple una regla',
        );
      });
    }
    if (!correcto) return INVALIDO;

    return def.transformaciones.reduce((actual, transformacion) => transformacion(actual), base);
  }

  validar(entrada, { en } = {}) {
    const ctx = crearContexto();
    const datos = this.ejecutar(entrada, [], ctx);
    if (ctx.incidencias.length) {
      return {
        exito: false,
        errores: ctx.incidencias.map((incidencia) => ({
          ...(en ? { en } : {}),
          ruta: formatearRuta(incidencia.ruta),
          codigo: incidencia.codigo,
          mensaje: incidencia.mensaje,
        })),
      };
    }
    return { exito: true, datos };
  }

  parsear(entrada, opciones) {
    const resultado = this.validar(entrada, opciones);
    if (!resultado.exito) throw new ValidationError('Datos invalidos', resultado.errores);
    return resultado.datos;
  }

  aJsonSchema() {
    const { def } = this;
    let salida = { ...this.jsonBase() };
    if (def.nulo) {
      if (salida.type) salida.type = [salida.type, 'null'].flat();
      else salida = { anyOf: [salida, { type: 'null' }] };
      if (salida.enum) salida.enum = [...salida.enum, null];
    }
    if (def.descripcion) salida.description = def.descripcion;
    if (def.tieneDefecto) salida.default = def.defecto;
    if (def.reglas.length) salida['x-reglas'] = [...def.reglas];
    return salida;
  }
}
