import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { crearDestinoMemoria, crearDestinoWebhook, crearNotificador } from '../../src/adapters/notificador.js';

const evento = { tipo: 'partida_registrada', codigo: 'ABC123' };

describe('destino en memoria', () => {
  it('guarda los eventos con la hora del reloj y los devuelve del mas nuevo al mas viejo', async () => {
    const reloj = mock.fn(() => new Date('2026-11-01T10:00:00.000Z'));
    const destino = crearDestinoMemoria({ reloj });
    await destino.enviar({ tipo: 'a' });
    await destino.enviar({ tipo: 'b' });

    assert.deepEqual(destino.recientes().map((e) => e.tipo), ['b', 'a']);
    assert.equal(destino.recientes()[0].registradoEn, '2026-11-01T10:00:00.000Z');
    assert.equal(reloj.mock.callCount(), 2);
  });

  it('descarta los eventos mas viejos al superar el limite', async () => {
    const destino = crearDestinoMemoria({ limite: 2 });
    for (const tipo of ['a', 'b', 'c']) await destino.enviar({ tipo });
    assert.deepEqual(destino.recientes().map((e) => e.tipo), ['c', 'b']);
  });
});

describe('destino webhook', () => {
  it('hace un POST con el evento en JSON', async () => {
    const fetchFn = mock.fn(async () => ({ ok: true, status: 204 }));
    await crearDestinoWebhook({ url: 'http://hooks.test/x', fetchFn }).enviar(evento);

    const [url, opciones] = fetchFn.mock.calls[0].arguments;
    assert.equal(url, 'http://hooks.test/x');
    assert.equal(opciones.method, 'POST');
    assert.equal(opciones.headers['content-type'], 'application/json');
    assert.deepEqual(JSON.parse(opciones.body), evento);
  });

  it('falla si el webhook no responde bien', async () => {
    const fetchFn = mock.fn(async () => ({ ok: false, status: 500 }));
    await assert.rejects(crearDestinoWebhook({ url: 'http://hooks.test/x', fetchFn }).enviar(evento), /500/);
  });
});

describe('notificador', () => {
  const destinoOk = () => ({ enviar: mock.fn(async () => {}) });
  const destinoRoto = () => ({ enviar: mock.fn(async () => { throw new Error('caido'); }) });

  it('entrega el mismo evento a todos los destinos', async () => {
    const a = destinoOk();
    const b = destinoOk();
    const resultado = await crearNotificador({ destinos: [a, b] }).enviar(evento);

    assert.deepEqual(resultado, { enviados: 2, fallidos: 0 });
    assert.deepEqual(a.enviar.mock.calls[0].arguments, [evento]);
    assert.deepEqual(b.enviar.mock.calls[0].arguments, [evento]);
  });

  it('tolera que un destino falle mientras otro funcione', async () => {
    const resultado = await crearNotificador({ destinos: [destinoRoto(), destinoOk()] }).enviar(evento);
    assert.deepEqual(resultado, { enviados: 1, fallidos: 1 });
  });

  it('falla cuando ningun destino recibe el evento', async () => {
    await assert.rejects(crearNotificador({ destinos: [destinoRoto(), destinoRoto()] }).enviar(evento), /Ningun destino/);
  });

  it('expone la cantidad de destinos', () => {
    assert.equal(crearNotificador({ destinos: [destinoOk(), destinoOk(), destinoOk()] }).destinos, 3);
  });
});
