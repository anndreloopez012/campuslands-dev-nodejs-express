import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { crearBusEventos } from '../src/core/eventos.js';
import { crearLogger } from '../src/core/logger.js';

function crearBus() {
  const logs = [];
  const logger = crearLogger({ salida: (linea) => logs.push(JSON.parse(linea)) });
  return { bus: crearBusEventos({ logger }), logs };
}

describe('bus de eventos', () => {
  it('entrega la carga a todos los suscriptores', async () => {
    const { bus } = crearBus();
    const a = mock.fn();
    const b = mock.fn();
    bus.suscribir('x', a);
    bus.suscribir('x', b);
    const resultado = await bus.emitir('x', { valor: 1 });
    assert.deepEqual(resultado, { entregados: 2, fallidos: 0 });
    assert.deepEqual(a.mock.calls[0].arguments, [{ valor: 1 }]);
    assert.deepEqual(b.mock.calls[0].arguments, [{ valor: 1 }]);
  });

  it('emitir sin suscriptores no falla', async () => {
    const { bus } = crearBus();
    assert.deepEqual(await bus.emitir('nadie', {}), { entregados: 0, fallidos: 0 });
  });

  it('espera a los manejadores asincronos', async () => {
    const { bus } = crearBus();
    let terminado = false;
    bus.suscribir('x', async () => {
      await new Promise((resolver) => setTimeout(resolver, 15));
      terminado = true;
    });
    await bus.emitir('x', {});
    assert.equal(terminado, true);
  });

  it('un manejador que falla no afecta a los demas ni a quien emite', async () => {
    const { bus, logs } = crearBus();
    const sano = mock.fn();
    bus.suscribir('x', () => {
      throw new Error('se rompio');
    });
    bus.suscribir('x', async () => {
      throw new Error('tambien async');
    });
    bus.suscribir('x', sano);
    const resultado = await bus.emitir('x', {});
    assert.deepEqual(resultado, { entregados: 1, fallidos: 2 });
    assert.equal(sano.mock.callCount(), 1);
    const errores = logs.filter((l) => l.msg === 'manejador_de_evento_fallido');
    assert.deepEqual(errores.map((l) => l.error), ['se rompio', 'tambien async']);
    assert.equal(errores[0].evento, 'x');
  });

  it('la carga llega congelada y no se comparte con quien emite', async () => {
    const { bus } = crearBus();
    let recibida;
    bus.suscribir('x', (carga) => {
      recibida = carga;
    });
    const original = { valor: 1 };
    await bus.emitir('x', original);
    assert.equal(Object.isFrozen(recibida), true);
    assert.notEqual(recibida, original);
    assert.equal(Object.isFrozen(original), false);
  });

  it('permite cancelar una suscripcion', async () => {
    const { bus } = crearBus();
    const manejador = mock.fn();
    const cancelar = bus.suscribir('x', manejador);
    assert.equal(bus.cantidad('x'), 1);
    cancelar();
    assert.equal(bus.cantidad('x'), 0);
    await bus.emitir('x', {});
    assert.equal(manejador.mock.callCount(), 0);
  });

  it('valida los argumentos de suscribir', () => {
    const { bus } = crearBus();
    assert.throws(() => bus.suscribir('', () => {}), /nombre/);
    assert.throws(() => bus.suscribir('x', 'no'), /funcion/);
  });

  it('un manejador puede suscribirse durante una emision sin afectarla', async () => {
    const { bus } = crearBus();
    const tardio = mock.fn();
    bus.suscribir('x', () => {
      bus.suscribir('x', tardio);
    });
    await bus.emitir('x', {});
    assert.equal(tardio.mock.callCount(), 0);
    await bus.emitir('x', {});
    assert.equal(tardio.mock.callCount(), 1);
  });
});
