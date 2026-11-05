// validador minimo de JSON Schema: solo lo que usa esta especificacion
const tipoDe = (valor) => {
  if (valor === null) return 'null';
  if (Array.isArray(valor)) return 'array';
  if (Number.isInteger(valor)) return 'integer';
  return typeof valor;
};

const coincideTipo = (esperado, real) => esperado === real || (esperado === 'number' && real === 'integer');

export function resolver(raiz, referencia) {
  if (!referencia.startsWith('#/')) throw new TypeError(`Solo se admiten referencias internas: ${referencia}`);
  const destino = referencia.slice(2).split('/').reduce((nodo, parte) => nodo?.[parte], raiz);
  if (destino === undefined) throw new TypeError(`Referencia rota: ${referencia}`);
  return destino;
}

export function validar(esquema, valor, raiz, ruta = '$') {
  if (esquema.$ref) return validar(resolver(raiz, esquema.$ref), valor, raiz, ruta);
  const errores = [];
  const error = (mensaje) => errores.push({ ruta, mensaje });

  if (esquema.const !== undefined && valor !== esquema.const) error(`debe ser ${JSON.stringify(esquema.const)}`);
  if (esquema.enum && !esquema.enum.includes(valor)) error(`debe ser uno de ${esquema.enum.join(', ')}`);
  if (esquema.type) {
    const tipos = [esquema.type].flat();
    if (!tipos.some((t) => coincideTipo(t, tipoDe(valor)))) {
      error(`se esperaba ${tipos.join(' o ')} y llego ${tipoDe(valor)}`);
      return errores;
    }
  }
  if (typeof valor === 'string') {
    if (esquema.minLength !== undefined && valor.length < esquema.minLength) error(`largo minimo ${esquema.minLength}`);
    if (esquema.maxLength !== undefined && valor.length > esquema.maxLength) error(`largo maximo ${esquema.maxLength}`);
    if (esquema.pattern && !new RegExp(esquema.pattern, 'u').test(valor)) error(`no cumple ${esquema.pattern}`);
  }
  if (typeof valor === 'number') {
    if (esquema.minimum !== undefined && valor < esquema.minimum) error(`minimo ${esquema.minimum}`);
    if (esquema.maximum !== undefined && valor > esquema.maximum) error(`maximo ${esquema.maximum}`);
    if (esquema.exclusiveMinimum !== undefined && valor <= esquema.exclusiveMinimum) error(`debe ser mayor a ${esquema.exclusiveMinimum}`);
  }
  if (Array.isArray(valor)) {
    if (esquema.minItems !== undefined && valor.length < esquema.minItems) error(`minimo ${esquema.minItems} elementos`);
    if (esquema.items) valor.forEach((item, i) => errores.push(...validar(esquema.items, item, raiz, `${ruta}[${i}]`)));
  }
  if (tipoDe(valor) === 'object') {
    for (const requerida of esquema.required ?? []) {
      if (!(requerida in valor)) error(`falta la propiedad ${requerida}`);
    }
    for (const [clave, interno] of Object.entries(valor)) {
      const definicion = esquema.properties?.[clave];
      if (definicion) errores.push(...validar(definicion, interno, raiz, `${ruta}.${clave}`));
      else if (esquema.additionalProperties === false) error(`propiedad no documentada: ${clave}`);
    }
  }
  return errores;
}

// recorre todo el documento y devuelve las referencias que no apuntan a nada
export function referenciasRotas(raiz) {
  const rotas = [];
  const visitar = (nodo) => {
    if (Array.isArray(nodo)) return nodo.forEach(visitar);
    if (nodo === null || typeof nodo !== 'object') return undefined;
    if (typeof nodo.$ref === 'string') {
      try {
        resolver(raiz, nodo.$ref);
      } catch {
        rotas.push(nodo.$ref);
      }
    }
    return Object.values(nodo).forEach(visitar);
  };
  visitar(raiz);
  return rotas;
}
