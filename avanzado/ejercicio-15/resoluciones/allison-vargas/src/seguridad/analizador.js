import { leerCsp } from './csp.js';

const SEIS_MESES = 15552000;

function revisarCsp(valor, hallazgos) {
  if (!valor) {
    hallazgos.push({ cabecera: 'Content-Security-Policy', nivel: 'alto', mensaje: 'falta la politica de contenido' });
    return;
  }
  const csp = leerCsp(valor);
  const scripts = csp['script-src'] ?? csp['default-src'] ?? [];
  if (scripts.includes("'unsafe-inline'") && !scripts.some((v) => v.startsWith("'nonce-") || v.startsWith("'sha"))) {
    hallazgos.push({ cabecera: 'Content-Security-Policy', nivel: 'alto', mensaje: "script-src permite 'unsafe-inline'" });
  }
  if (scripts.includes("'unsafe-eval'")) {
    hallazgos.push({ cabecera: 'Content-Security-Policy', nivel: 'medio', mensaje: "script-src permite 'unsafe-eval'" });
  }
  if (scripts.includes('*') || (csp['default-src'] ?? []).includes('*')) {
    hallazgos.push({ cabecera: 'Content-Security-Policy', nivel: 'alto', mensaje: 'permite scripts de cualquier origen' });
  }
  if (!csp['object-src'] || !csp['object-src'].includes("'none'")) {
    hallazgos.push({ cabecera: 'Content-Security-Policy', nivel: 'bajo', mensaje: "object-src deberia ser 'none'" });
  }
  if (!csp['frame-ancestors']) {
    hallazgos.push({ cabecera: 'Content-Security-Policy', nivel: 'bajo', mensaje: 'falta frame-ancestors' });
  }
}

function revisarHsts(valor, esHttps, hallazgos) {
  if (!esHttps) return;
  if (!valor) {
    hallazgos.push({ cabecera: 'Strict-Transport-Security', nivel: 'alto', mensaje: 'falta HSTS en un sitio https' });
    return;
  }
  const maxAge = Number(/max-age=(\d+)/i.exec(valor)?.[1] ?? 0);
  if (maxAge < SEIS_MESES) {
    hallazgos.push({ cabecera: 'Strict-Transport-Security', nivel: 'medio', mensaje: 'max-age menor a seis meses' });
  }
}

const ESPERADAS = [
  ['x-content-type-options', (v) => v === 'nosniff', 'medio', 'debe ser nosniff'],
  ['x-frame-options', (v) => ['deny', 'sameorigin'].includes(v?.toLowerCase()), 'medio', 'debe ser DENY o SAMEORIGIN'],
  ['referrer-policy', (v) => v && v !== 'unsafe-url' && v !== 'no-referrer-when-downgrade', 'bajo', 'politica de referrer debil o ausente'],
  ['permissions-policy', (v) => Boolean(v), 'bajo', 'falta Permissions-Policy'],
  ['cross-origin-opener-policy', (v) => Boolean(v), 'bajo', 'falta Cross-Origin-Opener-Policy'],
];

const PUNTOS = { alto: 30, medio: 15, bajo: 5 };

export function analizarCabeceras(cabeceras, { esHttps = false } = {}) {
  const h = Object.fromEntries(Object.entries(cabeceras).map(([k, v]) => [k.toLowerCase(), String(v)]));
  const hallazgos = [];
  revisarCsp(h['content-security-policy'], hallazgos);
  revisarHsts(h['strict-transport-security'], esHttps, hallazgos);
  for (const [nombre, prueba, nivel, mensaje] of ESPERADAS) {
    if (!prueba(h[nombre])) hallazgos.push({ cabecera: nombre, nivel, mensaje });
  }
  if (h['x-powered-by']) hallazgos.push({ cabecera: 'x-powered-by', nivel: 'bajo', mensaje: 'revela la tecnologia del servidor' });
  if (h['access-control-allow-origin'] === '*' && h['access-control-allow-credentials'] === 'true') {
    hallazgos.push({ cabecera: 'access-control-allow-origin', nivel: 'alto', mensaje: '"*" combinado con credenciales' });
  }
  const puntaje = Math.max(0, 100 - hallazgos.reduce((t, x) => t + PUNTOS[x.nivel], 0));
  let nota = 'F';
  if (puntaje >= 90) nota = 'A';
  else if (puntaje >= 75) nota = 'B';
  else if (puntaje >= 60) nota = 'C';
  else if (puntaje >= 40) nota = 'D';
  return { puntaje, nota, hallazgos };
}
