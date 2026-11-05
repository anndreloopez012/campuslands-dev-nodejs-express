import { Esquema, INVALIDO } from './base.js';

const esObjetoPlano = (valor) => {
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) return false;
  const prototipo = Object.getPrototypeOf(valor);
  return prototipo === Object.prototype || prototipo === null;
};

const exigirClaves = (shape, claves) => {
  for (const clave of claves) {
    if (!Object.hasOwn(shape, clave)) throw new Error(`El esquema no tiene el campo ${clave}`);
  }
};

export class Objeto extends Esquema {
  etiqueta = 'un objeto';

  constructor(def) {
    super({ desconocidos: 'rechazar', ...def });
  }

  get shape() {
    return this.def.shape;
  }

  estricto() {
    return this._con({ desconocidos: 'rechazar' });
  }

  descartar() {
    return this._con({ desconocidos: 'descartar' });
  }

  parcial({ profundo = false } = {}) {
    const shape = {};
    for (const [clave, hijo] of Object.entries(this.def.shape)) {
      shape[clave] = profundo && hijo instanceof Objeto
        ? hijo.parcial({ profundo: true }).opcional()
        : hijo.sinDefecto().opcional();
    }
    return this._con({ shape, verificaciones: [], reglas: [] });
  }

  pick(claves) {
    exigirClaves(this.def.shape, claves);
    const shape = Object.fromEntries(claves.map((clave) => [clave, this.def.shape[clave]]));
    return this._con({ shape, verificaciones: [], reglas: [] });
  }

  omit(claves) {
    exigirClaves(this.def.shape, claves);
    const shape = Object.fromEntries(Object.entries(this.def.shape).filter(([clave]) => !claves.includes(clave)));
    return this._con({ shape, verificaciones: [], reglas: [] });
  }

  extender(nuevos) {
    return this._con({ shape: { ...this.def.shape, ...nuevos } });
  }

  minimoUnCampo() {
    return this.verificar((valor, informar) => {
      if (!Object.keys(valor).length) informar({ codigo: 'sin_cambios', mensaje: 'debe incluir al menos un campo' });
    }, 'al menos un campo');
  }

  analizar(valor, ruta, ctx) {
    if (!esObjetoPlano(valor)) return this.tipoInvalido(valor, ruta, ctx);
    const { shape, desconocidos } = this.def;
    const antes = ctx.incidencias.length;
    const salida = {};

    for (const [clave, hijo] of Object.entries(shape)) {
      const crudo = Object.hasOwn(valor, clave) ? valor[clave] : undefined;
      const resultado = hijo.ejecutar(crudo, [...ruta, clave], ctx);
      if (resultado !== INVALIDO && resultado !== undefined) salida[clave] = resultado;
    }

    if (desconocidos === 'rechazar') {
      for (const clave of Object.keys(valor)) {
        if (!Object.hasOwn(shape, clave)) ctx.informar([...ruta, clave], 'campo_desconocido', 'campo no permitido');
      }
    }

    return ctx.incidencias.length > antes ? INVALIDO : salida;
  }

  jsonBase() {
    const propiedades = {};
    const requeridos = [];
    for (const [clave, hijo] of Object.entries(this.def.shape)) {
      propiedades[clave] = hijo.aJsonSchema();
      if (!hijo.def.opcional && !hijo.def.tieneDefecto) requeridos.push(clave);
    }
    return {
      type: 'object',
      properties: propiedades,
      ...(requeridos.length ? { required: requeridos } : {}),
      additionalProperties: this.def.desconocidos !== 'rechazar',
    };
  }
}
