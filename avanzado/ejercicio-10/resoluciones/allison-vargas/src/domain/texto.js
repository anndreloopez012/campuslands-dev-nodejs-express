import { CHARSETS } from '../constants/csv.js';
import { crear } from '../errores/index.js';

export function normalizarClave(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function claveDeEncabezado(texto) {
  return normalizarClave(texto).replace(/[^a-z0-9]/g, '');
}

export function leerCharset(contentType = '') {
  const partes = contentType.split(';').slice(1);
  for (const parte of partes) {
    const [nombre, valor] = parte.split('=').map((p) => p.trim());
    if (nombre?.toLowerCase() === 'charset' && valor) return valor.replaceAll('"', '').toLowerCase();
  }
  return 'utf-8';
}

export function decodificar(buffer, charset = 'utf-8') {
  const etiqueta = CHARSETS[charset];
  if (!etiqueta) throw crear('CODIFICACION_INVALIDA', { charset });
  let texto;
  try {
    texto = new TextDecoder(etiqueta, { fatal: true, ignoreBOM: true }).decode(buffer);
  } catch (error) {
    throw crear('CODIFICACION_INVALIDA', { charset }, { causa: error });
  }
  const bom = texto.startsWith('\uFEFF');
  return { texto: bom ? texto.slice(1) : texto, bom, codificacion: etiqueta };
}
