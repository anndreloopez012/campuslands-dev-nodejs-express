import { randomBytes } from 'node:crypto';

export const DIRECTIVAS_CONOCIDAS = new Set([
  'default-src', 'script-src', 'style-src', 'img-src', 'font-src', 'connect-src', 'media-src',
  'object-src', 'frame-src', 'child-src', 'worker-src', 'manifest-src', 'base-uri', 'form-action',
  'frame-ancestors', 'upgrade-insecure-requests', 'report-uri', 'report-to',
]);

export const CSP_POR_DEFECTO = Object.freeze({
  'default-src': ["'self'"],
  'script-src': ["'self'", 'NONCE'],
  'style-src': ["'self'", 'NONCE'],
  'img-src': ["'self'", 'data:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'none'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
});

const PALABRAS_CON_COMILLAS = new Set(['self', 'none', 'unsafe-inline', 'unsafe-eval', 'strict-dynamic']);

export const generarNonce = () => randomBytes(16).toString('base64');

export function validarDirectivas(directivas) {
  for (const [nombre, valores] of Object.entries(directivas)) {
    if (!DIRECTIVAS_CONOCIDAS.has(nombre)) throw new TypeError(`Directiva CSP desconocida: ${nombre}`);
    if (!Array.isArray(valores)) throw new TypeError(`La directiva ${nombre} debe ser una lista`);
    for (const valor of valores) {
      if (typeof valor !== 'string' || /[;,\s]/.test(valor)) throw new TypeError(`Valor CSP invalido en ${nombre}: ${valor}`);
      if (PALABRAS_CON_COMILLAS.has(valor)) throw new TypeError(`En ${nombre} usa '${valor}' con comillas simples`);
    }
  }
  return directivas;
}

export function construirCsp(directivas, { nonce, reporte } = {}) {
  const partes = [];
  for (const [nombre, valores] of Object.entries(directivas)) {
    const finales = valores
      .map((v) => (v === 'NONCE' ? (nonce ? `'nonce-${nonce}'` : null) : v))
      .filter(Boolean);
    partes.push(finales.length ? `${nombre} ${finales.join(' ')}` : nombre);
  }
  if (reporte) partes.push(`report-uri ${reporte}`);
  return partes.join('; ');
}

export function leerCsp(texto) {
  const resultado = {};
  for (const parte of texto.split(';')) {
    const [nombre, ...valores] = parte.trim().split(/\s+/);
    if (nombre) resultado[nombre.toLowerCase()] = valores;
  }
  return resultado;
}
