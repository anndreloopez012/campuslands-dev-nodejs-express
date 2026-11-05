import { ValidationError } from '../utils/errors.js';

export const filtroEntero = (minimo, maximo) => (texto, error) => {
  if (!/^\d+$/.test(texto) || Number(texto) < minimo || Number(texto) > maximo) {
    error(`debe ser un entero entre ${minimo} y ${maximo}`);
    return undefined;
  }
  return Number(texto);
};

export const filtroEnum = (valores) => (texto, error) => {
  if (!valores.includes(texto)) {
    error(`debe ser uno de: ${valores.join(', ')}`);
    return undefined;
  }
  return texto;
};

export const filtroBooleano = (texto, error) => {
  if (texto !== 'true' && texto !== 'false') {
    error('debe ser true o false');
    return undefined;
  }
  return texto === 'true';
};

function leerEntero(valor, porDefecto, minimo, maximo, nombre, errores) {
  if (valor === undefined) return porDefecto;
  if (!/^\d+$/.test(valor) || Number(valor) < minimo || Number(valor) > maximo) {
    errores.push({ campo: nombre, mensaje: `${nombre} debe ser un entero entre ${minimo} y ${maximo}` });
    return porDefecto;
  }
  return Number(valor);
}

function leerIncluir(valor, incluibles, errores) {
  const pedidos = [];
  for (const nombre of valor.split(',').map((parte) => parte.trim())) {
    if (!incluibles.includes(nombre)) {
      errores.push({ campo: 'incluir', mensaje: `${nombre || '(vacio)'} no es valido. Opciones: ${incluibles.join(', ')}` });
    } else if (pedidos.includes(nombre)) {
      errores.push({ campo: 'incluir', mensaje: `${nombre} esta repetido` });
    } else {
      pedidos.push(nombre);
    }
  }
  return pedidos;
}

export function leerIncluirDetalle(query, incluibles) {
  const errores = [];
  let incluir = [];
  for (const [clave, valor] of Object.entries(query)) {
    if (clave !== 'incluir') errores.push({ campo: clave, mensaje: 'parametro no permitido' });
    else if (typeof valor !== 'string') errores.push({ campo: clave, mensaje: 'no puede repetirse ni enviarse como objeto' });
    else incluir = leerIncluir(valor.trim(), incluibles, errores);
  }
  if (errores.length) throw new ValidationError('Parametros de consulta invalidos', errores, 'CONSULTA_INVALIDA');
  return incluir;
}

export function leerListado(query, { filtros = {}, ordenes, ordenPorDefecto, incluibles = [], limiteDefault = 10, limiteMax = 50 }) {
  const errores = [];
  const permitidos = ['pagina', 'limite', 'orden', 'incluir', ...Object.keys(filtros)];
  const validos = {};

  for (const [clave, valor] of Object.entries(query)) {
    if (!permitidos.includes(clave)) {
      errores.push({ campo: clave, mensaje: 'parametro no permitido' });
    } else if (typeof valor !== 'string') {
      errores.push({ campo: clave, mensaje: 'no puede repetirse ni enviarse como objeto' });
    } else {
      validos[clave] = valor.trim();
    }
  }

  const resultadoFiltros = {};
  for (const [nombre, leer] of Object.entries(filtros)) {
    if (validos[nombre] === undefined) continue;
    const valor = leer(validos[nombre], (mensaje) => errores.push({ campo: nombre, mensaje }));
    if (valor !== undefined) resultadoFiltros[nombre] = valor;
  }

  let orden = ordenPorDefecto;
  if (validos.orden !== undefined) {
    if (Object.hasOwn(ordenes, validos.orden)) orden = validos.orden;
    else errores.push({ campo: 'orden', mensaje: `debe ser uno de: ${Object.keys(ordenes).join(', ')}` });
  }

  const incluir = validos.incluir === undefined ? [] : leerIncluir(validos.incluir, incluibles, errores);
  const pagina = leerEntero(validos.pagina, 1, 1, 100000, 'pagina', errores);
  const limite = leerEntero(validos.limite, limiteDefault, 1, limiteMax, 'limite', errores);

  if (errores.length) throw new ValidationError('Parametros de consulta invalidos', errores, 'CONSULTA_INVALIDA');
  return { filtros: resultadoFiltros, orden, comparador: ordenes[orden], incluir, pagina, limite };
}
