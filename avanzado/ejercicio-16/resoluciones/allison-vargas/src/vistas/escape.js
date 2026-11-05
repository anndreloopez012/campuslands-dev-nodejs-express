import { escaparRegExp } from '../sanitizacion/texto.js';

const ENTIDADES = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;',
};

export const escaparHtml = (texto) => String(texto).replace(/[&<>"'`]/g, (c) => ENTIDADES[c]);

// primero se escapa el texto y despues se marca el termino ya escapado; asi el <mark> es la unica etiqueta real
export function resaltar(texto, termino) {
  const seguro = escaparHtml(texto);
  if (!termino) return seguro;
  const patron = new RegExp(escaparRegExp(escaparHtml(termino)), 'gi');
  return seguro.replace(patron, (encontrado) => `<mark>${encontrado}</mark>`);
}

export function paginaFicha(producto, termino) {
  const lineas = producto.descripcion.split('\n').map((l) => `<p>${resaltar(l, termino)}</p>`).join('');
  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>${escaparHtml(producto.nombre)}</title></head>
<body>
<h1>${resaltar(producto.nombre, termino)}</h1>
<p>${escaparHtml(producto.marca)} - ${escaparHtml(producto.categoria)} - $${producto.precio.toLocaleString('es-CL')}</p>
<p>Tallas: ${producto.tallas.map(escaparHtml).join(', ')}</p>
<p>Colores: ${producto.colores.map(escaparHtml).join(', ')}</p>
${lineas}
</body>
</html>`;
}
