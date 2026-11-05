import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CSP_POR_DEFECTO, construirCsp, generarNonce, leerCsp, validarDirectivas,
} from '../src/seguridad/csp.js';
import { cabecerasSeguras, validarHsts } from '../src/seguridad/cabeceras.js';
import { validarOrigenes } from '../src/seguridad/cors.js';
import { analizarCabeceras } from '../src/seguridad/analizador.js';
import { escaparHtml } from '../src/vistas/carta.js';

describe('content security policy', () => {
  it('reemplaza NONCE por el nonce de la peticion y agrega report-uri', () => {
    const texto = construirCsp({ 'script-src': ["'self'", 'NONCE'], 'object-src': ["'none'"], 'upgrade-insecure-requests': [] }, {
      nonce: 'abc', reporte: '/r',
    });
    assert.equal(texto, "script-src 'self' 'nonce-abc'; object-src 'none'; upgrade-insecure-requests; report-uri /r");
    assert.equal(construirCsp({ 'script-src': ['NONCE'] }), 'script-src');
  });

  it('valida directivas desconocidas, valores con separadores y palabras sin comillas', () => {
    assert.equal(validarDirectivas(CSP_POR_DEFECTO), CSP_POR_DEFECTO);
    assert.throws(() => validarDirectivas({ 'scrip-src': [] }), /desconocida/);
    assert.throws(() => validarDirectivas({ 'img-src': ['a; b'] }), /invalido/);
    assert.throws(() => validarDirectivas({ 'img-src': ['self'] }), /comillas/);
    assert.throws(() => validarDirectivas({ 'img-src': 'self' }), /lista/);
  });

  it('lee una politica y genera nonces distintos', () => {
    assert.deepEqual(leerCsp("default-src 'self'; Object-Src 'none';"), {
      'default-src': ["'self'"], 'object-src': ["'none'"],
    });
    assert.notEqual(generarNonce(), generarNonce());
    assert.match(generarNonce(), /^[A-Za-z0-9+/]{22}==$/);
  });
});

describe('configuracion de cabeceras', () => {
  it('construye HSTS y exige requisitos para la precarga', () => {
    assert.equal(validarHsts(), 'max-age=31536000; includeSubDomains');
    assert.equal(validarHsts({ maxAge: 63072000, precarga: true }), 'max-age=63072000; includeSubDomains; preload');
    assert.equal(validarHsts({ maxAge: 100, incluirSubdominios: false }), 'max-age=100');
    assert.throws(() => validarHsts({ maxAge: 100, precarga: true }), TypeError);
    assert.throws(() => validarHsts({ maxAge: -1 }), TypeError);
  });

  it('rechaza referrer invalido y origenes peligrosos', () => {
    assert.throws(() => cabecerasSeguras({ referrer: 'siempre' }), TypeError);
    assert.throws(() => cabecerasSeguras({ csp: { foo: [] } }), TypeError);
    assert.throws(() => validarOrigenes(['*']), /\*/);
    assert.throws(() => validarOrigenes(['localhost:3000']), /mal escrito/);
    assert.throws(() => validarOrigenes(['http://a.test/']), /mal escrito/);
    assert.doesNotThrow(() => validarOrigenes(['https://a.test:8443', /^https:\/\/x$/]));
  });

  it('escapa html incluyendo comillas y acento grave', () => {
    assert.equal(escaparHtml('<img src=x onerror="a(\'1\')">`'), '&lt;img src=x onerror=&quot;a(&#39;1&#39;)&quot;&gt;&#96;');
  });
});

describe('analizador de cabeceras', () => {
  const buenas = {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'nonce-x' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Strict-Transport-Security': 'max-age=31536000',
  };

  it('da nota A a una configuracion completa', () => {
    assert.deepEqual(analizarCabeceras(buenas, { esHttps: true }), { puntaje: 100, nota: 'A', hallazgos: [] });
  });

  it('detecta configuraciones debiles y baja la nota', () => {
    const informe = analizarCabeceras({
      'content-security-policy': "default-src *; script-src 'unsafe-inline' 'unsafe-eval' *",
      'x-frame-options': 'ALLOWALL',
      'referrer-policy': 'unsafe-url',
      'strict-transport-security': 'max-age=60',
      'x-powered-by': 'Express',
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true',
    }, { esHttps: true });
    const mensajes = informe.hallazgos.map((h) => h.mensaje);
    assert.ok(mensajes.includes("script-src permite 'unsafe-inline'"));
    assert.ok(mensajes.includes("script-src permite 'unsafe-eval'"));
    assert.ok(mensajes.includes('permite scripts de cualquier origen'));
    assert.ok(mensajes.includes('max-age menor a seis meses'));
    assert.ok(mensajes.includes('"*" combinado con credenciales'));
    assert.ok(mensajes.includes('revela la tecnologia del servidor'));
    assert.equal(informe.puntaje, 0);
    assert.equal(informe.nota, 'F');
  });

  it('solo exige HSTS cuando el sitio es https', () => {
    const { 'Strict-Transport-Security': _, ...sinHsts } = buenas;
    assert.equal(analizarCabeceras(sinHsts).nota, 'A');
    const https = analizarCabeceras(sinHsts, { esHttps: true });
    assert.equal(https.hallazgos[0].mensaje, 'falta HSTS en un sitio https');
    assert.equal(https.nota, 'C');
    assert.equal(analizarCabeceras({}).hallazgos[0].mensaje, 'falta la politica de contenido');
  });
});
