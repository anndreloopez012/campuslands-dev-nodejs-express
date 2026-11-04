import { ValidationError } from '../utils/errors.js';

const PARAMETROS = ['orden', 'vista', 'nulos', 'pagina', 'limite'];
const DIRECCIONES = ['asc', 'desc'];
const POSICIONES_NULOS = ['primero', 'ultimo'];

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

const comparadores = {
  numero: (a, b) => a - b,
  texto: (a, b) => collator.compare(a, b),
  fecha: (a, b) => Date.parse(a) - Date.parse(b),
  booleano: (a, b) => Number(a) - Number(b),
};

const estaVacio = (valor) => valor === null || valor === undefined || valor === '';

const leerValor = (definicion, campo, item) =>
  definicion.leer ? definicion.leer(item) : item[campo];

function comparar(definicion, a, b) {
  if (definicion.tipo === 'enum') {
    return definicion.valores.indexOf(a) - definicion.valores.indexOf(b);
  }
  return comparadores[definicion.tipo](a, b);
}

function filtrarParametros(query, errores) {
  const validos = {};
  for (const [clave, valor] of Object.entries(query)) {
    if (!PARAMETROS.includes(clave)) {
      errores.push({ campo: clave, mensaje: 'parametro no permitido' });
    } else if (typeof valor !== 'string') {
      errores.push({ campo: clave, mensaje: 'no puede repetirse ni enviarse como objeto' });
    } else {
      validos[clave] = valor.trim();
    }
  }
  return validos;
}

function leerCriterio(token, config, errores) {
  let texto = token.trim();
  let direccion = 'asc';
  let prefijo = false;

  if (texto.startsWith('-')) {
    prefijo = true;
    direccion = 'desc';
    texto = texto.slice(1);
  }

  const partes = texto.split(':');
  const campo = partes[0].trim();

  if (!campo) {
    errores.push({ campo: 'orden', mensaje: 'hay un criterio vacio' });
    return null;
  }
  if (partes.length > 2) {
    errores.push({ campo: 'orden', mensaje: `criterio con formato invalido: ${token.trim()}` });
    return null;
  }
  if (!Object.hasOwn(config.campos, campo)) {
    errores.push({
      campo: 'orden',
      mensaje: `${campo} no es un campo ordenable. Validos: ${Object.keys(config.campos).join(', ')}`,
    });
    return null;
  }
  if (partes.length === 2) {
    if (prefijo) {
      errores.push({ campo: 'orden', mensaje: `usa "-${campo}" o "${campo}:desc", no ambos` });
      return null;
    }
    direccion = partes[1].trim().toLowerCase();
    if (!DIRECCIONES.includes(direccion)) {
      errores.push({ campo: 'orden', mensaje: `la direccion de ${campo} debe ser asc o desc` });
      return null;
    }
  }
  return { campo, direccion };
}

function leerCriterios(texto, config, errores) {
  const criterios = [];
  const tokens = texto.split(',');

  if (tokens.length > config.maxCriterios) {
    errores.push({ campo: 'orden', mensaje: `maximo ${config.maxCriterios} criterios` });
  }

  for (const token of tokens.slice(0, config.maxCriterios)) {
    const criterio = leerCriterio(token, config, errores);
    if (!criterio) continue;
    if (criterios.some((c) => c.campo === criterio.campo)) {
      errores.push({ campo: 'orden', mensaje: `${criterio.campo} esta repetido` });
      continue;
    }
    criterios.push(criterio);
  }
  return criterios;
}

function resolverOrden(validos, config, errores) {
  const { orden, vista } = validos;

  if (orden !== undefined && vista !== undefined) {
    errores.push({ campo: 'vista', mensaje: 'no se puede combinar con orden' });
    return { criterios: [], vista: null, predeterminado: false };
  }
  if (orden !== undefined) {
    if (!orden) {
      errores.push({ campo: 'orden', mensaje: 'no puede estar vacio' });
      return { criterios: [], vista: null, predeterminado: false };
    }
    return { criterios: leerCriterios(orden, config, errores), vista: null, predeterminado: false };
  }
  if (vista !== undefined) {
    if (!Object.hasOwn(config.vistas, vista)) {
      errores.push({
        campo: 'vista',
        mensaje: `vista desconocida. Validas: ${Object.keys(config.vistas).join(', ')}`,
      });
      return { criterios: [], vista: null, predeterminado: false };
    }
    return { criterios: leerCriterios(config.vistas[vista], config, errores), vista, predeterminado: false };
  }
  return { criterios: leerCriterios(config.porDefecto, config, errores), vista: null, predeterminado: true };
}

function leerNulos(validos, errores) {
  if (validos.nulos === undefined) return 'ultimo';
  const posicion = validos.nulos.toLowerCase();
  if (!POSICIONES_NULOS.includes(posicion)) {
    errores.push({ campo: 'nulos', mensaje: 'debe ser primero o ultimo' });
    return 'ultimo';
  }
  return posicion;
}

function leerEntero(validos, clave, porDefecto, minimo, maximo, errores) {
  if (validos[clave] === undefined) return porDefecto;
  if (!/^\d+$/.test(validos[clave])) {
    errores.push({ campo: clave, mensaje: `${clave} debe ser un entero` });
    return porDefecto;
  }
  const numero = Number(validos[clave]);
  if (numero < minimo || numero > maximo) {
    errores.push({ campo: clave, mensaje: `${clave} debe estar entre ${minimo} y ${maximo}` });
    return porDefecto;
  }
  return numero;
}

function ordenar(items, criterios, nulos, config) {
  const completos = criterios.some((c) => c.campo === 'id')
    ? criterios
    : [...criterios, { campo: 'id', direccion: 'asc' }];
  const nulosPrimero = nulos === 'primero';

  return [...items].sort((x, y) => {
    for (const { campo, direccion } of completos) {
      const definicion = config.campos[campo];
      const a = leerValor(definicion, campo, x);
      const b = leerValor(definicion, campo, y);
      const aVacio = estaVacio(a);
      const bVacio = estaVacio(b);

      if (aVacio && bVacio) continue;
      if (aVacio) return nulosPrimero ? -1 : 1;
      if (bVacio) return nulosPrimero ? 1 : -1;

      const resultado = comparar(definicion, a, b);
      if (resultado !== 0) return direccion === 'asc' ? resultado : -resultado;
    }
    return 0;
  });
}

export function consultarOrdenado(items, query, config) {
  const errores = [];
  const validos = filtrarParametros(query, errores);
  const { criterios, vista, predeterminado } = resolverOrden(validos, config, errores);
  const nulos = leerNulos(validos, errores);
  const pagina = leerEntero(validos, 'pagina', 1, 1, 100000, errores);
  const limite = leerEntero(validos, 'limite', config.limiteDefault, 1, config.limiteMax, errores);

  if (errores.length) {
    throw new ValidationError('Parametros de ordenamiento invalidos', errores, 'ORDEN_INVALIDO');
  }

  const ordenados = ordenar(items, criterios, nulos, config);
  const total = ordenados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const inicio = (pagina - 1) * limite;

  return {
    data: ordenados.slice(inicio, inicio + limite),
    orden: { aplicado: criterios, desempate: 'id:asc', nulos, vista, predeterminado },
    paginacion: { pagina, limite, total, totalPaginas },
  };
}

export function describirOrden(config) {
  return {
    campos: Object.fromEntries(
      Object.entries(config.campos).map(([campo, definicion]) => [
        campo,
        definicion.tipo === 'enum'
          ? { tipo: definicion.tipo, valores: definicion.valores }
          : { tipo: definicion.tipo },
      ]),
    ),
    vistas: config.vistas,
    porDefecto: config.porDefecto,
    maxCriterios: config.maxCriterios,
  };
}
