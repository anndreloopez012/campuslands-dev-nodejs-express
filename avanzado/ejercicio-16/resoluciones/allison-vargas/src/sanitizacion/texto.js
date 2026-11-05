// caracteres invisibles o que cambian la direccion del texto (se usan para confundir a quien lee)
const INVISIBLES = /[\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g;
// caracteres de control, excepto salto de linea y tabulacion
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const ETIQUETAS = /<\/?[a-zA-Z][^<>]*>|<!--[\s\S]*?-->/g;

export function limpiarTexto(valor, { multilinea = false, quitarHtml = false } = {}) {
  const cambios = [];
  let texto = valor;
  const normalizado = texto.normalize('NFC');
  if (normalizado !== texto) cambios.push('normalizado a NFC');
  texto = normalizado;

  const sinInvisibles = texto.replace(INVISIBLES, '');
  if (sinInvisibles !== texto) cambios.push('se quitaron caracteres invisibles');
  texto = sinInvisibles;

  const sinControl = texto.replace(CONTROL, '');
  if (sinControl !== texto) cambios.push('se quitaron caracteres de control');
  texto = sinControl;

  if (quitarHtml) {
    const sinEtiquetas = texto.replace(ETIQUETAS, '');
    if (sinEtiquetas !== texto) cambios.push('se quitaron etiquetas html');
    texto = sinEtiquetas;
  }

  const espaciado = multilinea
    ? texto.replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).join('\n')
      .replace(/\n{3,}/g, '\n\n')
    : texto.replace(/\s+/g, ' ');
  const final = espaciado.trim();
  if (final !== texto) cambios.push('se ordenaron los espacios');
  texto = final;

  return { texto, cambios };
}

export const sinAcentos = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase();

export const escaparRegExp = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
