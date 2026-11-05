import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { crearAnticheatHttp } from '../../src/adapters/anticheat.http.js';
import { DependenciaError } from '../../src/utils/errors.js';

const respuesta = (status, cuerpo) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => cuerpo,
});

const crear = (fetchFn, opciones = {}) => crearAnticheatHttp({ url: 'http://anticheat.test', fetchFn, ...opciones });

function secuencia(...pasos) {
  let posicion = 0;
  return mock.fn(async () => {
    const paso = pasos[Math.min(posicion, pasos.length - 1)];
    posicion += 1;
    if (paso instanceof Error) throw paso;
    return paso;
  });
}

describe('adaptador anticheat http', () => {
  afterEach(() => {
    mock.timers.reset();
    mock.restoreAll();
  });

  it('consulta la url del jugador y devuelve limpio', async () => {
    const fetchFn = mock.fn(async () => respuesta(200, { baneado: false }));
    const veredicto = await crear(fetchFn).verificar('Ana');

    assert.equal(veredicto.limpio, true);
    assert.equal(fetchFn.mock.callCount(), 1);
    const [url, opciones] = fetchFn.mock.calls[0].arguments;
    assert.equal(url, 'http://anticheat.test/jugadores/Ana');
    assert.equal(opciones.headers.accept, 'application/json');
    assert.ok(opciones.signal instanceof AbortSignal);
  });

  it('quita la barra final de la url base y codifica el nick', async () => {
    const fetchFn = mock.fn(async () => respuesta(200, { baneado: false }));
    await crearAnticheatHttp({ url: 'http://anticheat.test//', fetchFn }).verificar('a b/c');
    assert.equal(fetchFn.mock.calls[0].arguments[0], 'http://anticheat.test/jugadores/a%20b%2Fc');
  });

  it('devuelve el motivo cuando el jugador esta baneado', async () => {
    const fetchFn = mock.fn(async () => respuesta(200, { baneado: true, motivo: 'Aimbot' }));
    const veredicto = await crear(fetchFn).verificar('Ana');
    assert.equal(veredicto.limpio, false);
    assert.equal(veredicto.motivo, 'Aimbot');
  });

  it('trata un 404 como jugador sin antecedentes', async () => {
    const fetchFn = mock.fn(async () => respuesta(404, {}));
    const veredicto = await crear(fetchFn).verificar('Ana');
    assert.equal(veredicto.limpio, true);
    assert.equal(fetchFn.mock.callCount(), 1);
  });

  it('reintenta una vez si el servicio responde 5xx', async () => {
    const fetchFn = secuencia(respuesta(502, {}), respuesta(200, { baneado: false }));
    const veredicto = await crear(fetchFn).verificar('Ana');
    assert.equal(veredicto.limpio, true);
    assert.equal(fetchFn.mock.callCount(), 2);
  });

  it('reintenta una vez si falla la red', async () => {
    const fetchFn = secuencia(new TypeError('fetch failed'), respuesta(200, { baneado: false }));
    const veredicto = await crear(fetchFn).verificar('Ana');
    assert.equal(veredicto.limpio, true);
    assert.equal(fetchFn.mock.callCount(), 2);
  });

  it('falla con DependenciaError cuando se agotan los reintentos', async () => {
    const fetchFn = secuencia(new TypeError('fetch failed'));
    await assert.rejects(crear(fetchFn).verificar('Ana'), (error) => {
      assert.ok(error instanceof DependenciaError);
      assert.equal(error.statusCode, 503);
      assert.equal(error.codigo, 'ANTICHEAT_NO_DISPONIBLE');
      assert.equal(error.cabeceras['Retry-After'], '5');
      assert.equal(error.causa.message, 'fetch failed');
      return true;
    });
    assert.equal(fetchFn.mock.callCount(), 2);
  });

  it('no reintenta cuando reintentos vale 0', async () => {
    const fetchFn = secuencia(respuesta(503, {}));
    await assert.rejects(crear(fetchFn, { reintentos: 0 }).verificar('Ana'), DependenciaError);
    assert.equal(fetchFn.mock.callCount(), 1);
  });

  it('no reintenta un error 4xx distinto de 404', async () => {
    const fetchFn = secuencia(respuesta(401, {}));
    await assert.rejects(crear(fetchFn).verificar('Ana'), DependenciaError);
    assert.equal(fetchFn.mock.callCount(), 1);
  });

  it('falla si la respuesta no es JSON', async () => {
    const fetchFn = mock.fn(async () => ({
      status: 200,
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    }));
    await assert.rejects(crear(fetchFn).verificar('Ana'), DependenciaError);
  });

  it('aborta la peticion al pasar el timeout', async () => {
    mock.timers.enable({ apis: ['setTimeout'] });
    const fetchFn = mock.fn((url, { signal }) => new Promise((resolver, rechazar) => {
      signal.addEventListener('abort', () => rechazar(new Error('abortado')));
    }));

    const pendiente = crear(fetchFn, { timeoutMs: 1500, reintentos: 0 }).verificar('Ana');
    mock.timers.tick(1499);
    assert.equal(fetchFn.mock.calls[0].arguments[1].signal.aborted, false);
    mock.timers.tick(1);

    await assert.rejects(pendiente, (error) => {
      assert.equal(error.codigo, 'ANTICHEAT_NO_DISPONIBLE');
      assert.equal(error.causa.message, 'abortado');
      return true;
    });
  });

  it('usa el fetch global cuando no se inyecta uno', async () => {
    const simulado = mock.method(globalThis, 'fetch', async () => respuesta(200, { baneado: true, motivo: 'Wallhack' }));
    const veredicto = await crearAnticheatHttp({ url: 'http://anticheat.test' }).verificar('Ana');
    assert.equal(veredicto.limpio, false);
    assert.equal(simulado.mock.callCount(), 1);
  });

  it('ping responde true o falla segun el estado del servicio', async () => {
    assert.equal(await crear(mock.fn(async () => respuesta(200, {}))).ping(), true);
    await assert.rejects(crear(mock.fn(async () => respuesta(404, {}))).ping(), DependenciaError);
    await assert.rejects(crear(secuencia(respuesta(500, {})), { reintentos: 0 }).ping(), DependenciaError);
  });

  it('funciona contra un servidor local real', async () => {
    const pedidos = [];
    const servidor = http.createServer((req, res) => {
      pedidos.push(req.url);
      res.setHeader('content-type', 'application/json');
      if (req.url === '/jugadores/tramposo') return res.end(JSON.stringify({ baneado: true, motivo: 'Triggerbot' }));
      if (req.url === '/salud') return res.end('{}');
      res.statusCode = 404;
      return res.end('{}');
    });
    await new Promise((resolver) => servidor.listen(0, resolver));
    try {
      const adaptador = crearAnticheatHttp({ url: `http://127.0.0.1:${servidor.address().port}` });
      const malo = await adaptador.verificar('tramposo');
      assert.equal(malo.limpio, false);
      assert.equal(malo.motivo, 'Triggerbot');
      assert.equal((await adaptador.verificar('honesto')).limpio, true);
      assert.equal(await adaptador.ping(), true);
      assert.deepEqual(pedidos, ['/jugadores/tramposo', '/jugadores/honesto', '/salud']);
    } finally {
      servidor.closeAllConnections();
      await new Promise((resolver) => servidor.close(resolver));
    }
  });
});
