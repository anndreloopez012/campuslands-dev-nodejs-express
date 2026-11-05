import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ORIGEN_MALO, ORIGEN_OK, levantarApi } from '../soporte/api.js';

let api;
before(async () => { api = await levantarApi(); });
after(async () => { await api.cerrar(); });

async function conApi(opciones, prueba) {
  const otra = await levantarApi(opciones);
  try {
    await prueba(otra);
  } finally {
    await otra.cerrar();
  }
}

const preflight = (origen, metodo, cabeceras) => api.pedir('/pedidos', {
  method: 'OPTIONS',
  headers: {
    origin: origen,
    'access-control-request-method': metodo,
    ...(cabeceras ? { 'access-control-request-headers': cabeceras } : {}),
  },
});

describe('cabeceras de seguridad', () => {
  it('se envian en respuestas correctas, errores y rutas inexistentes', async () => {
    for (const ruta of ['/puestos', '/puestos/999', '/no-existe']) {
      const { cabeceras } = await api.pedir(ruta);
      assert.match(cabeceras.get('content-security-policy'), /default-src 'self'/);
      assert.equal(cabeceras.get('x-content-type-options'), 'nosniff');
      assert.equal(cabeceras.get('x-frame-options'), 'DENY');
      assert.equal(cabeceras.get('referrer-policy'), 'strict-origin-when-cross-origin');
      assert.equal(cabeceras.get('permissions-policy'), 'camera=(), microphone=(), geolocation=(self), payment=()');
      assert.equal(cabeceras.get('cross-origin-opener-policy'), 'same-origin');
      assert.equal(cabeceras.get('cross-origin-resource-policy'), 'same-origin');
      assert.equal(cabeceras.get('x-xss-protection'), '0');
      assert.equal(cabeceras.get('x-powered-by'), null);
    }
  });

  it('usa un nonce distinto por peticion y es el mismo que llevan los scripts del html', async () => {
    const a = await api.pedir('/puestos/1/carta');
    const b = await api.pedir('/puestos/1/carta');
    const nonceDe = (r) => /'nonce-([^']+)'/.exec(r.cabeceras.get('content-security-policy'))[1];
    assert.notEqual(nonceDe(a), nonceDe(b));
    assert.match(a.cabeceras.get('content-type'), /text\/html/);
    assert.ok(a.cuerpo.includes(`<script nonce="${nonceDe(a)}">`));
    assert.ok(a.cuerpo.includes(`<style nonce="${nonceDe(a)}">`));
    assert.match(a.cabeceras.get('content-security-policy'), /report-uri \/avanzado\/ejercicio-15\/csp-reportes/);
  });

  it('escapa el contenido de los usuarios en el html', async () => {
    const r = await api.json('/puestos/2/resenas', { autor: '<b>Zoe</b>', texto: '<script>alert(1)</script> rico', estrellas: 5 });
    assert.equal(r.status, 201);
    const html = (await api.pedir('/puestos/2/carta')).cuerpo;
    assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt; rico'));
    assert.ok(html.includes('&lt;b&gt;Zoe&lt;/b&gt;'));
    assert.equal(html.includes('<script>alert(1)'), false);
  });

  it('HSTS solo aparece cuando la conexion es https segun un proxy de confianza', async () => {
    const http = await api.pedir('/puestos', { headers: { 'x-forwarded-proto': 'https' } });
    assert.equal(http.cabeceras.get('strict-transport-security'), null);
    await conApi({ confiarEnProxy: 'loopback' }, async (detrasDeProxy) => {
      const sinHttps = await detrasDeProxy.pedir('/puestos');
      assert.equal(sinHttps.cabeceras.get('strict-transport-security'), null);
      const https = await detrasDeProxy.pedir('/puestos', { headers: { 'x-forwarded-proto': 'https' } });
      assert.equal(https.cabeceras.get('strict-transport-security'), 'max-age=31536000; includeSubDomains');
      const informe = await detrasDeProxy.pedir('/seguridad/autoevaluacion', { headers: { 'x-forwarded-proto': 'https' } });
      assert.equal(informe.cuerpo.data.https, true);
      assert.equal(informe.cuerpo.data.nota, 'A');
    });
  });

  it('las rutas sensibles no se guardan en cache', async () => {
    const p = await api.json('/pedidos', { puestoId: 1, items: [{ platoId: 1, cantidad: 3 }, { platoId: 3, cantidad: 1 }] });
    assert.equal(p.status, 201);
    assert.equal(p.cuerpo.data.total, 6600);
    assert.equal(p.cabeceras.get('cache-control'), 'no-store');
    assert.equal(p.cabeceras.get('pragma'), 'no-cache');
    const g = await api.pedir(`/pedidos/${p.cuerpo.data.id}`);
    assert.equal(g.cabeceras.get('cache-control'), 'no-store');
    assert.equal((await api.pedir('/puestos')).cabeceras.get('cache-control'), 'public, max-age=60');
  });
});

describe('cors', () => {
  it('refleja solo origenes permitidos y siempre agrega Vary: Origin', async () => {
    const ok = await api.pedir('/puestos', { headers: { origin: ORIGEN_OK } });
    assert.equal(ok.cabeceras.get('access-control-allow-origin'), ORIGEN_OK);
    assert.equal(ok.cabeceras.get('access-control-allow-credentials'), 'true');
    assert.equal(ok.cabeceras.get('access-control-expose-headers'), 'Location');
    assert.match(ok.cabeceras.get('vary'), /Origin/);
    const sub = await api.pedir('/puestos', { headers: { origin: 'https://pedidos.comida-urbana.test' } });
    assert.equal(sub.cabeceras.get('access-control-allow-origin'), 'https://pedidos.comida-urbana.test');
    const malo = await api.pedir('/puestos', { headers: { origin: ORIGEN_MALO } });
    assert.equal(malo.status, 200);
    assert.equal(malo.cabeceras.get('access-control-allow-origin'), null);
    const parecido = await api.pedir('/puestos', { headers: { origin: 'https://x.comida-urbana.test.evil.example' } });
    assert.equal(parecido.cabeceras.get('access-control-allow-origin'), null);
  });

  it('responde preflight permitidos con 204 y rechaza los demas', async () => {
    const ok = await preflight(ORIGEN_OK, 'POST', 'content-type, x-request-id');
    assert.equal(ok.status, 204);
    assert.equal(ok.cabeceras.get('access-control-allow-methods'), 'GET, POST');
    assert.equal(ok.cabeceras.get('access-control-allow-headers'), 'Content-Type, X-Request-Id');
    assert.equal(ok.cabeceras.get('access-control-max-age'), '600');
    assert.match(ok.cabeceras.get('vary'), /Access-Control-Request-Headers/);
    const origen = await preflight(ORIGEN_MALO, 'POST');
    assert.equal(origen.status, 403);
    assert.equal(origen.cuerpo.codigo, 'ORIGEN_NO_PERMITIDO');
    const metodo = await preflight(ORIGEN_OK, 'DELETE');
    assert.equal(metodo.cuerpo.codigo, 'PREFLIGHT_RECHAZADO');
    const cabecera = await preflight(ORIGEN_OK, 'POST', 'authorization');
    assert.equal(cabecera.status, 403);
    assert.match(cabecera.cuerpo.message, /authorization/);
  });
});

describe('reportes csp y analisis', () => {
  it('acepta reportes en formato antiguo y Reporting API', async () => {
    const antiguo = await api.pedir('/csp-reportes', {
      method: 'POST',
      headers: { 'content-type': 'application/csp-report' },
      body: JSON.stringify({ 'csp-report': { 'violated-directive': 'script-src', 'blocked-uri': 'https://cdn.malo.test/x.js', 'document-uri': 'http://localhost/carta' } }),
    });
    assert.equal(antiguo.status, 204);
    const nuevo = await api.pedir('/csp-reportes', {
      method: 'POST',
      headers: { 'content-type': 'application/reports+json' },
      body: JSON.stringify([{ type: 'csp-violation', body: { effectiveDirective: 'img-src', blockedURL: 'http://x/y.png' } }, { type: 'otro' }]),
    });
    assert.equal(nuevo.status, 204);
    const lista = await api.pedir('/csp-reportes');
    assert.equal(lista.cabeceras.get('cache-control'), 'no-store');
    assert.deepEqual(lista.cuerpo.data.map((r) => r.directiva), ['img-src', 'script-src']);
    const vacio = await api.json('/csp-reportes', { cualquier: 'cosa' });
    assert.equal(vacio.status, 400);
    const tipo = await api.pedir('/csp-reportes', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
    assert.equal(tipo.status, 415);
  });

  it('se autoevalua y analiza cabeceras ajenas', async () => {
    const auto = await api.pedir('/seguridad/autoevaluacion');
    assert.deepEqual(auto.cuerpo.data, {
      puntaje: 100, nota: 'A', hallazgos: [], https: false,
    });
    const ajeno = await api.json('/seguridad/analizar', { cabeceras: { 'X-Frame-Options': 'DENY' }, https: true });
    assert.equal(ajeno.status, 200);
    assert.equal(ajeno.cuerpo.data.nota, 'F');
    const malo = await api.json('/seguridad/analizar', { cabeceras: { 'mal nombre': 1 }, https: 'si' });
    assert.equal(malo.status, 400);
    assert.equal(malo.cuerpo.errores.length, 2);
  });
});

describe('validaciones', () => {
  it('valida pedidos y resenas', async () => {
    const p = await api.json('/pedidos', { puestoId: 1, items: [{ platoId: 99, cantidad: 1 }] });
    assert.equal(p.status, 400);
    assert.equal(p.cuerpo.errores[0].campo, 'items[0].platoId');
    const v = await api.json('/pedidos', { puestoId: 1, items: [] });
    assert.equal(v.cuerpo.errores[0].campo, 'items');
    const x = await api.json('/pedidos', { puestoId: 1, items: [5, { platoId: 1, cantidad: 50, extra: 1 }] });
    assert.deepEqual(x.cuerpo.errores.map((e) => e.campo), ['items[0]', 'items[1].extra', 'items[1].cantidad']);
    const r = await api.json('/puestos/1/resenas', { autor: 'A', texto: 'no', estrellas: 9 });
    assert.equal(r.cuerpo.errores.length, 3);
    assert.equal((await api.pedir('/pedidos/999')).cuerpo.codigo, 'PEDIDO_NO_ENCONTRADO');
    assert.equal((await api.pedir('/puestos/9/carta')).cuerpo.codigo, 'PUESTO_NO_ENCONTRADO');
    assert.equal((await api.pedir('/')).cuerpo.topic, 'seguridad de headers');
  });
});
