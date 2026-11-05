function propiedad(regla) {
  let propiedad;
  switch (regla.tipo) {
    case 'texto':
    case 'secreto':
      propiedad = { type: 'string', minLength: regla.min, maxLength: regla.max };
      if (regla.patron) propiedad.pattern = regla.patron.source;
      break;
    case 'email':
      propiedad = { type: 'string', format: 'email', maxLength: 120 };
      break;
    case 'entero':
      propiedad = { type: 'integer', minimum: regla.min, maximum: regla.max };
      break;
    case 'numero':
      propiedad = { type: 'number', minimum: regla.min, maximum: regla.max };
      break;
    case 'booleano':
      propiedad = { type: 'boolean' };
      break;
    case 'enum':
      propiedad = { type: 'string', enum: regla.valores };
      break;
    case 'fecha':
      propiedad = { type: 'string', format: 'date' };
      break;
    default:
      propiedad = {};
  }
  if (regla.descripcion) propiedad.description = regla.descripcion;
  if (regla.porDefecto !== undefined) propiedad.default = regla.porDefecto;
  return propiedad;
}

export function aEsquemaJson(esquema, { parcial = false } = {}) {
  const propiedades = {};
  const requeridos = [];
  for (const [campo, regla] of Object.entries(esquema)) {
    propiedades[campo] = propiedad(regla);
    if (regla.requerido && !parcial) requeridos.push(campo);
  }
  const resultado = { type: 'object', additionalProperties: false, properties: propiedades };
  if (requeridos.length) resultado.required = requeridos;
  if (parcial) resultado.minProperties = 1;
  return resultado;
}
