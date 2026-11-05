import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { instalarApagado } from '../src/apagado.js';
import { crearLogger } from '../src/core/logger.js';

const logger = crearLogger({ salida: () => {} });

async function iniciar(manejador) {
  const servidor = http.createServer(manejador);
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  return { servidor, url: `http://127.0.0.1:${servidor.address().port}` };
}

const procesoFalso = () => ({ on: mock.fn(), exit: mock.fn() });

describe('apagado ordenado', () => {
  it('termina las peticiones en curso, ejecuta los ganchos y sale con 0', async () => {
    const { servidor, url } = await iniciar((req, res) => setTimeout(() => res.end('terminada'), 120));
    const proceso = procesoFalso();
    const orden = [];
    const apagar = instalarApagado({
      servidor,
      logger,
      proceso,
      antes: () => orden.push('antes'),
      despues: async () => orden.push('despues'),
    });

    const enCurso = fetch(url).then((r) => r.text());
    await new Promise((resolver) => setTimeout(resolver, 30));
    const codigo = await apagar('SIGTERM');

    assert.equal(await enCurso, 'terminada');
    assert.equal(codigo, 0);
    assert.deepEqual(orden, ['antes', 'despues']);
    assert.deepEqual(proceso.exit.mock.calls.map((c) => c.arguments), [[0]]);
    await assert.rejects(fetch(url));
  });

  it('se registra en SIGTERM y SIGINT y solo apaga una vez', async () => {
    const { servidor } = await iniciar((req, res) => res.end('ok'));
    const proceso = procesoFalso();
    const despues = mock.fn(async () => {});
    instalarApagado({ servidor, logger, proceso, despues });

    assert.deepEqual(proceso.on.mock.calls.map((c) => c.arguments[0]), ['SIGTERM', 'SIGINT']);
    const [alSigterm, alSigint] = proceso.on.mock.calls.map((c) => c.arguments[1]);
    alSigterm();
    alSigint();
    await new Promise((resolver) => setTimeout(resolver, 50));
    assert.equal(despues.mock.callCount(), 1);
    assert.equal(proceso.exit.mock.callCount(), 1);
  });

  it('fuerza el cierre y sale con 1 si una peticion no termina a tiempo', async () => {
    const { servidor, url } = await iniciar(() => {});
    const proceso = procesoFalso();
    const apagar = instalarApagado({ servidor, logger, proceso, tiempoMaximoMs: 60 });

    const colgada = fetch(url).catch((error) => error);
    await new Promise((resolver) => setTimeout(resolver, 20));
    const codigo = await apagar('SIGINT');

    assert.equal(codigo, 1);
    assert.ok((await colgada) instanceof Error);
    assert.deepEqual(proceso.exit.mock.calls.map((c) => c.arguments), [[1]]);
  });

  it('sale con 1 si el gancho final falla', async () => {
    const { servidor } = await iniciar((req, res) => res.end('ok'));
    const proceso = procesoFalso();
    const apagar = instalarApagado({
      servidor,
      logger,
      proceso,
      despues: async () => {
        throw new Error('no pude cerrar');
      },
    });
    assert.equal(await apagar('SIGTERM'), 1);
  });
});
