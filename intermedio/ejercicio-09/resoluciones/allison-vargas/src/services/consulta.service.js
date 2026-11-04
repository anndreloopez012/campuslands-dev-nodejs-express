import { ValidationError } from '../utils/errors.js';

const PARAMETROS_RESERVADOS = ['pagina', 'limite', 'sort', 'q'];
const MAX_CRITERIOS_ORDEN = 3;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

const normalizar = (valor) =>
  String(valor).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const comoLista = (valor) => valor.split(',').map((v) => v.trim()).filter(Boolean);

function leerEntero(nombre, valor, { min = 1, max } = {}) {
  const numero = Number(valor);
  if (valor.trim() === '' || !Number.isInteger(numero)) return { error: `${nombre} debe ser un entero` };
  if (numero < min) return { error: `${nombre} debe ser mayor o igual a ${min}` };
  if (max !== undefined && numero > max) return { error: `${nombre} debe ser menor o igual a ${max}` };
  return { valor: numero };
}

const lectores = {
  enum(nombre, valor, regla) {
    const lista = comoLista(valor);
    const invalidos = lista.filter((v) => !regla.valores.includes(v));
    if (!lista.length || invalidos.length) {
      return { error: `${nombre} debe ser uno de: ${regla.valores.join(', ')}` };
    }
    return { valor: lista };
  },
  texto(nombre, valor) {
    const lista = comoLista(valor);
    if (!lista.length) return { error: `${nombre} no puede estar vacio` };
    return { valor: lista.map(normalizar) };
  },
  entero(nombre, valor, regla) {
    return leerEntero(nombre, valor, { min: regla.min ?? 0, max: regla.max });
  },
  fecha(nombre, valor) {
    if (!FECHA.test(valor) || Number.isNaN(Date.parse(valor))) {
      return { error: `${nombre} debe tener el formato AAAA-MM-DD` };
    }
    return { valor };
  },
  booleano(nombre, valor) {
    if (valor !== 'true' && valor !== 'false') return { error: `${nombre} debe ser true o false` };
    return { valor: valor === 'true' };
  },
};

const comparadores = {
  eq: (campo, esperado) => (item) => item[campo] === esperado,
  gte: (campo, esperado) => (item) => item[campo] >= esperado,
  lte: (campo, esperado) => (item) => item[campo] <= esperado,
  en: (campo, lista, tipo) => (item) => {
    const actual = tipo === 'texto' ? normalizar(item[campo]) : item[campo];
    return lista.includes(actual);
  },
};

function leerPaginacion(query, config, errores) {
  const resultado = { pagina: 1, limite: config.limiteDefault };

  if (query.pagina !== undefined) {
    const { valor, error } = leerEntero('pagina', query.pagina, { min: 1 });
    if (error) errores.push({ campo: 'pagina', mensaje: error });
    else resultado.pagina = valor;
  }
  if (query.limite !== undefined) {
    const { valor, error } = leerEntero('limite', query.limite, { min: 1, max: config.limiteMax });
    if (error) errores.push({ campo: 'limite', mensaje: error });
    else resultado.limite = valor;
  }
  return resultado;
}

function leerOrden(query, config, errores) {
  const texto = query.sort ?? config.ordenDefault;
  const criterios = [];

  for (const parte of comoLista(texto)) {
    const [campo, direccion = 'asc'] = parte.split(':');
    if (!config.ordenables.includes(campo)) {
      errores.push({ campo: 'sort', mensaje: `no se puede ordenar por ${campo}. Validos: ${config.ordenables.join(', ')}` });
    } else if (direccion !== 'asc' && direccion !== 'desc') {
      errores.push({ campo: 'sort', mensaje: `la direccion de ${campo} debe ser asc o desc` });
    } else if (criterios.some((c) => c.campo === campo)) {
      errores.push({ campo: 'sort', mensaje: `${campo} esta repetido en sort` });
    } else {
      criterios.push({ campo, direccion });
    }
  }

  if (criterios.length > MAX_CRITERIOS_ORDEN) {
    errores.push({ campo: 'sort', mensaje: `se permiten maximo ${MAX_CRITERIOS_ORDEN} criterios de orden` });
  }
  return criterios;
}

function leerBusqueda(query, errores) {
  if (query.q === undefined) return null;
  const texto = normalizar(query.q);
  if (texto.length < 2 || texto.length > 50) {
    errores.push({ campo: 'q', mensaje: 'q debe tener entre 2 y 50 caracteres' });
    return null;
  }
  return texto;
}

function leerFiltros(query, config, errores) {
  const aplicados = [];

  for (const [nombre, regla] of Object.entries(config.filtros)) {
    if (query[nombre] === undefined) continue;

    const { valor, error } = lectores[regla.tipo](nombre, query[nombre], regla);
    if (error) {
      errores.push({ campo: nombre, mensaje: error });
      continue;
    }

    const operacion = Array.isArray(valor) ? 'en' : regla.op ?? 'eq';
    aplicados.push({ nombre, valor, predicado: comparadores[operacion](regla.campo, valor, regla.tipo) });
  }
  return aplicados;
}

function validarParametros(query, config, errores) {
  for (const [nombre, valor] of Object.entries(query)) {
    const permitido = PARAMETROS_RESERVADOS.includes(nombre) || nombre in config.filtros;
    if (!permitido) {
      errores.push({ campo: nombre, mensaje: 'parametro no permitido' });
    } else if (typeof valor !== 'string') {
      errores.push({ campo: nombre, mensaje: `${nombre} no puede repetirse ni enviarse como objeto` });
    }
  }
}

function comparar(a, b) {
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, 'es', { sensitivity: 'base' });
  if (typeof a === 'boolean') return Number(a) - Number(b);
  return a < b ? -1 : a > b ? 1 : 0;
}

export function consultar(items, query, config) {
  const errores = [];

  validarParametros(query, config, errores);

  const validos = Object.fromEntries(Object.entries(query).filter(([, valor]) => typeof valor === 'string'));
  const { pagina, limite } = leerPaginacion(validos, config, errores);
  const orden = leerOrden(validos, config, errores);
  const busqueda = leerBusqueda(validos, errores);
  const filtros = leerFiltros(validos, config, errores);

  if (errores.length) throw new ValidationError('Parametros de consulta invalidos', errores, 'CONSULTA_INVALIDA');

  let resultado = items.filter((item) => filtros.every((f) => f.predicado(item)));

  if (busqueda) {
    resultado = resultado.filter((item) =>
      config.busqueda.some((campo) => normalizar(item[campo]).includes(busqueda)));
  }

  resultado = [...resultado].sort((a, b) => {
    for (const { campo, direccion } of orden) {
      const diferencia = comparar(a[campo], b[campo]);
      if (diferencia !== 0) return direccion === 'asc' ? diferencia : -diferencia;
    }
    return a.id - b.id;
  });

  const total = resultado.length;
  const totalPaginas = Math.ceil(total / limite);
  const inicio = (pagina - 1) * limite;

  return {
    data: resultado.slice(inicio, inicio + limite),
    paginacion: {
      pagina,
      limite,
      total,
      totalPaginas,
      hayAnterior: pagina > 1,
      haySiguiente: pagina < totalPaginas,
    },
    consulta: {
      filtros: Object.fromEntries(filtros.map((f) => [f.nombre, f.valor])),
      q: busqueda,
      orden: orden.map((o) => `${o.campo}:${o.direccion}`),
    },
  };
}
