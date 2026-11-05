import {
  CATEGORIAS, coloresCampo, nombreCampo, precioCampo, skuCampo, tallasCampo, textoCampo,
} from '../sanitizacion/campos.js';
import { limpiarTexto } from '../sanitizacion/texto.js';
import {
  exigirCuerpo, leerOpcion, leerPaginacion, rechazarSobrantes, terminar,
} from './comunes.js';

const CAMPOS = ['sku', 'nombre', 'marca', 'categoria', 'precio', 'tallas', 'colores', 'descripcion'];
export const ORDENES = Object.freeze(['nombre', '-nombre', 'precio', '-precio']);

export function validarProducto(cuerpo, { parcial = false, categoriaActual } = {}) {
  const errores = [];
  const cambios = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, CAMPOS, errores);
  if (parcial && Object.keys(cuerpo).length === 0) errores.push({ campo: 'cuerpo', mensaje: 'debe traer al menos un campo' });
  const presente = (campo) => !parcial || cuerpo[campo] !== undefined;
  const datos = {};
  if (presente('sku')) datos.sku = skuCampo(cuerpo, errores, cambios);
  if (presente('nombre')) datos.nombre = nombreCampo(cuerpo, 'nombre', errores, cambios);
  if (presente('marca')) datos.marca = nombreCampo(cuerpo, 'marca', errores, cambios, { max: 30 });
  if (presente('categoria')) datos.categoria = leerOpcion(cuerpo, 'categoria', CATEGORIAS, errores);
  if (presente('precio')) datos.precio = precioCampo(cuerpo, errores);
  const categoria = datos.categoria ?? categoriaActual;
  if (presente('tallas') && categoria) datos.tallas = tallasCampo(cuerpo, categoria, errores, cambios);
  if (parcial && datos.categoria && datos.categoria !== categoriaActual && cuerpo.tallas === undefined) {
    errores.push({ campo: 'tallas', mensaje: 'al cambiar la categoria hay que enviar las tallas nuevas' });
  }
  if (presente('colores')) datos.colores = coloresCampo(cuerpo, errores, cambios);
  if (presente('descripcion')) {
    datos.descripcion = textoCampo(cuerpo, 'descripcion', errores, cambios, {
      min: 0, max: 1000, multilinea: true, quitarHtml: true, requerido: false,
    }) ?? '';
  }
  return { datos: terminar(errores, datos), cambios };
}

export function leerBusqueda(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['q', 'marca', 'categoria', 'talla', 'precioMax', 'orden', 'pagina', 'limite'], errores);
  const filtros = {};
  if (consulta.q !== undefined) {
    const { texto } = limpiarTexto(String(consulta.q));
    if (texto.length < 2 || texto.length > 60) errores.push({ campo: 'q', mensaje: 'debe tener entre 2 y 60 caracteres' });
    filtros.q = texto;
  }
  if (consulta.marca !== undefined) filtros.marca = limpiarTexto(String(consulta.marca)).texto.toLowerCase();
  filtros.categoria = leerOpcion(consulta, 'categoria', CATEGORIAS, errores, { requerido: false });
  if (consulta.talla !== undefined) {
    const tallas = [consulta.talla].flat().map((t) => t.trim().toUpperCase().replace(',', '.'));
    if (tallas.length > 5 || tallas.some((t) => !/^(\d{2}(\.5)?|XS|S|M|L|XL|XXL)$/.test(t))) {
      errores.push({ campo: 'talla', mensaje: 'tallas invalidas (maximo 5)' });
    }
    filtros.tallas = tallas.map((t) => (/^\d/.test(t) ? Number(t) : t));
  }
  if (consulta.precioMax !== undefined) {
    if (!/^\d{1,7}$/.test(consulta.precioMax)) errores.push({ campo: 'precioMax', mensaje: 'debe ser un entero sin signos ni decimales' });
    else filtros.precioMax = Number(consulta.precioMax);
  }
  const orden = leerOpcion(consulta, 'orden', ORDENES, errores, { requerido: false }) ?? 'nombre';
  const { pagina, limite } = leerPaginacion(consulta, errores);
  return terminar(errores, {
    filtros, orden, pagina, limite,
  });
}

export function validarPrevisualizacion(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['texto', 'multilinea', 'quitarHtml'], errores);
  if (typeof cuerpo.texto !== 'string') errores.push({ campo: 'texto', mensaje: 'debe ser texto' });
  for (const campo of ['multilinea', 'quitarHtml']) {
    if (cuerpo[campo] !== undefined && typeof cuerpo[campo] !== 'boolean') errores.push({ campo, mensaje: 'debe ser booleano' });
  }
  return terminar(errores, { texto: cuerpo.texto, multilinea: cuerpo.multilinea ?? false, quitarHtml: cuerpo.quitarHtml ?? false });
}
