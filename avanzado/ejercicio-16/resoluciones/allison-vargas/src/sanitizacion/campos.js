import { limpiarTexto } from './texto.js';

export const CATEGORIAS = Object.freeze(['sneakers', 'poleras', 'polerones', 'gorros', 'pantalones']);
export const TALLAS_ROPA = Object.freeze(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
const NOMBRE_PERMITIDO = /^[\p{L}\p{N} '&.,()+/-]+$/u;

export function textoCampo(cuerpo, campo, errores, cambios, {
  min = 1, max, multilinea = false, quitarHtml = false, patron, requerido = true,
} = {}) {
  const valor = cuerpo[campo];
  if (valor === undefined || valor === null) {
    if (requerido) errores.push({ campo, mensaje: 'es obligatorio' });
    return undefined;
  }
  if (typeof valor !== 'string') {
    errores.push({ campo, mensaje: 'debe ser texto' });
    return undefined;
  }
  const limpio = limpiarTexto(valor, { multilinea, quitarHtml });
  for (const cambio of limpio.cambios) cambios.push({ campo, cambio });
  const { texto } = limpio;
  if (texto.length < min) errores.push({ campo, mensaje: `debe tener al menos ${min} caracteres` });
  else if (max && texto.length > max) errores.push({ campo, mensaje: `debe tener como maximo ${max} caracteres` });
  else if (patron && !patron.test(texto)) errores.push({ campo, mensaje: 'tiene caracteres no permitidos' });
  return texto;
}

export const nombreCampo = (cuerpo, campo, errores, cambios, opciones = {}) => textoCampo(
  cuerpo, campo, errores, cambios, { min: 2, max: 80, patron: NOMBRE_PERMITIDO, ...opciones },
);

export function skuCampo(cuerpo, errores, cambios) {
  const valor = cuerpo.sku;
  if (typeof valor !== 'string') {
    errores.push({ campo: 'sku', mensaje: valor === undefined ? 'es obligatorio' : 'debe ser texto' });
    return undefined;
  }
  const sku = valor.normalize('NFKC').toUpperCase().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (sku !== valor) cambios.push({ campo: 'sku', cambio: 'normalizado a mayusculas y guiones' });
  if (!/^[A-Z0-9-]{4,20}$/.test(sku)) errores.push({ campo: 'sku', mensaje: 'debe tener de 4 a 20 letras, numeros o guiones' });
  return sku;
}

export function precioCampo(cuerpo, errores) {
  const valor = cuerpo.precio;
  // un string como "1e5" o "  990" no se convierte: el tipo debe venir bien desde el cliente
  if (typeof valor !== 'number' || !Number.isInteger(valor)) {
    errores.push({ campo: 'precio', mensaje: valor === undefined ? 'es obligatorio' : 'debe ser un entero en pesos' });
    return undefined;
  }
  if (valor < 990 || valor > 2_000_000) errores.push({ campo: 'precio', mensaje: 'debe estar entre 990 y 2000000' });
  return valor;
}

export function tallasCampo(cuerpo, categoria, errores, cambios) {
  const valor = cuerpo.tallas;
  if (!Array.isArray(valor) || valor.length === 0 || valor.length > 25) {
    errores.push({ campo: 'tallas', mensaje: 'debe ser una lista de 1 a 25 tallas' });
    return undefined;
  }
  const resultado = new Set();
  valor.forEach((talla, i) => {
    if (categoria === 'sneakers') {
      const numero = typeof talla === 'string' ? Number(talla.trim().replace(',', '.')) : talla;
      if (typeof numero !== 'number' || !Number.isFinite(numero) || numero < 34 || numero > 48 || (numero * 2) % 1 !== 0) {
        errores.push({ campo: `tallas[${i}]`, mensaje: 'talla de calzado entre 34 y 48, en medios puntos' });
      } else resultado.add(numero);
      return;
    }
    const texto = typeof talla === 'string' ? talla.trim().toUpperCase() : '';
    if (!TALLAS_ROPA.includes(texto)) errores.push({ campo: `tallas[${i}]`, mensaje: `debe ser una de: ${TALLAS_ROPA.join(', ')}` });
    else resultado.add(texto);
  });
  const lista = categoria === 'sneakers'
    ? [...resultado].sort((a, b) => a - b)
    : TALLAS_ROPA.filter((t) => resultado.has(t));
  if (lista.length !== valor.length || lista.some((t, i) => t !== valor[i])) {
    cambios.push({ campo: 'tallas', cambio: 'normalizadas, sin repetidos y ordenadas' });
  }
  return lista;
}

export function coloresCampo(cuerpo, errores, cambios) {
  const valor = cuerpo.colores;
  if (valor === undefined) return [];
  if (!Array.isArray(valor) || valor.length > 8) {
    errores.push({ campo: 'colores', mensaje: 'debe ser una lista de hasta 8 colores' });
    return undefined;
  }
  const colores = [];
  valor.forEach((color, i) => {
    if (typeof color !== 'string') {
      errores.push({ campo: `colores[${i}]`, mensaje: 'debe ser texto' });
      return;
    }
    const limpio = limpiarTexto(color).texto.toLowerCase();
    if (!/^[\p{L} ]{3,20}$/u.test(limpio)) errores.push({ campo: `colores[${i}]`, mensaje: 'color invalido' });
    else if (!colores.includes(limpio)) colores.push(limpio);
  });
  if (colores.length !== valor.length || colores.some((c, i) => c !== valor[i])) {
    cambios.push({ campo: 'colores', cambio: 'normalizados en minusculas y sin repetidos' });
  }
  return colores;
}
