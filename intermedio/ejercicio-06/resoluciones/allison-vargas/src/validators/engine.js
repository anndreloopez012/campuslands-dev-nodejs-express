const resolver = (valor) => (typeof valor === 'function' ? valor() : valor);

const estaVacio = (valor) =>
  valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '');

function validarTexto(campo, regla, valor) {
  if (typeof valor !== 'string') return { error: `${campo} debe ser texto` };

  let texto = valor.trim();
  if (regla.mayusculas) texto = texto.toUpperCase();

  if (regla.min !== undefined && texto.length < regla.min) {
    return { error: `${campo} debe tener al menos ${regla.min} caracteres` };
  }
  if (regla.max !== undefined && texto.length > regla.max) {
    return { error: `${campo} no puede superar ${regla.max} caracteres` };
  }
  if (regla.pattern && !regla.pattern.test(texto)) {
    return { error: regla.mensajePattern ?? `${campo} no tiene un formato valido` };
  }
  return { valor: texto };
}

function validarNumero(campo, regla, valor, entero) {
  const numero = typeof valor === 'string' && regla.coerce ? Number(valor) : valor;

  if (typeof numero !== 'number' || !Number.isFinite(numero)) {
    return { error: `${campo} debe ser un numero` };
  }
  if (entero && !Number.isInteger(numero)) {
    return { error: `${campo} debe ser un entero` };
  }

  const min = resolver(regla.min);
  const max = resolver(regla.max);
  if (min !== undefined && numero < min) return { error: `${campo} debe ser mayor o igual a ${min}` };
  if (max !== undefined && numero > max) return { error: `${campo} debe ser menor o igual a ${max}` };

  return { valor: numero };
}

function validarOpcion(campo, regla, valor) {
  if (!regla.enum.includes(valor)) {
    return { error: `${campo} debe ser uno de: ${regla.enum.join(', ')}` };
  }
  return { valor };
}

const validadores = {
  string: (campo, regla, valor) => validarTexto(campo, regla, valor),
  integer: (campo, regla, valor) => validarNumero(campo, regla, valor, true),
  number: (campo, regla, valor) => validarNumero(campo, regla, valor, false),
  enum: (campo, regla, valor) => validarOpcion(campo, regla, valor),
};

export function validar(esquema, entrada = {}) {
  const errores = [];
  const datos = {};

  for (const [campo, regla] of Object.entries(esquema)) {
    const original = entrada?.[campo];

    if (estaVacio(original)) {
      if (regla.required) {
        errores.push({ campo, mensaje: `${campo} es obligatorio` });
      } else if (regla.default !== undefined) {
        datos[campo] = regla.default;
      }
      continue;
    }

    const { valor, error } = validadores[regla.type](campo, regla, original);
    if (error) errores.push({ campo, mensaje: error });
    else datos[campo] = valor;
  }

  return { errores, datos };
}
