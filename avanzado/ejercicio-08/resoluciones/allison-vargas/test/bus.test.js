import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pausa } from '../soporte/datos.js';
import { DATOS_DE, crearBusDePrueba, rechazaCon } from '../soporte/entorno.js';

const vuelta = (sesionId = 1) => ({ ...DATOS_DE['vuelta:completada'], sesionId });

describe('bus: suscripcion y emision', () => {
  it('entrega el evento a quien se suscribio, en el orden de registro', () => {
    const { bus } = crearBusDePrueba();
    const orden = [];
    bus.suscribir('vuelta:completada', () => orden.push('a'));
    bus.suscribir('vuelta:completada', () => orden.push('b'));
    bus.suscribir('vuelta:completada', () => orden.push('c'));
    bus.emitir('vuelta:completada', vuelta());
    assert.deepEqual(orden, ['a', 'b', 'c']);
  });

  it('alPrincipio coloca el manejador antes de los demas', () => {
    const { bus } = crearBusDePrueba();
    const orden = [];
    bus.suscribir('vuelta:completada', () => orden.push('normal'));
    bus.suscribir('vuelta:completada', () => orden.push('primero'), { alPrincipio: true });
    bus.suscribir('vuelta:completada', () => orden.push('ultimo-una-vez'), { unaVez: true });
    bus.suscribir('vuelta:completada', () => orden.push('primero-una-vez'), { alPrincipio: true, unaVez: true });
    bus.emitir('vuelta:completada', vuelta());
    assert.deepEqual(orden, ['primero-una-vez', 'primero', 'normal', 'ultimo-una-vez']);
  });

  it('el sobre trae secuencia, hora, sesion y datos congelados', () => {
    const { bus } = crearBusDePrueba();
    let recibido;
    bus.suscribir('vuelta:completada', (e) => { recibido = e; });
    const devuelto = bus.emitir('vuelta:completada', vuelta(4));
    assert.equal(recibido, devuelto);
    assert.deepEqual([recibido.seq, recibido.evento, recibido.sesionId], [1, 'vuelta:completada', 4]);
    assert.equal(recibido.en, '2026-11-05T14:00:00.000Z');
    assert.ok(Object.isFrozen(recibido.datos));
    assert.throws(() => { 'use strict'; recibido.datos.tiempoMs = 1; }, TypeError);
  });

  it('el comodin recibe todos los eventos despues de los especificos', () => {
    const { bus } = crearBusDePrueba();
    const visto = [];
    bus.suscribir('*', (e) => visto.push(`*:${e.evento}`));
    bus.suscribir('sesion:abortada', (e) => visto.push(`especifico:${e.evento}`));
    bus.emitir('sesion:abortada', DATOS_DE['sesion:abortada']);
    bus.emitir('sesion:finalizada', DATOS_DE['sesion:finalizada']);
    assert.deepEqual(visto, ['especifico:sesion:abortada', '*:sesion:abortada', '*:sesion:finalizada']);
  });

  it('unaVez se entrega una sola vez y desaparece de la lista', () => {
    const { bus } = crearBusDePrueba();
    let llamadas = 0;
    bus.suscribir('vuelta:completada', () => { llamadas += 1; }, { unaVez: true });
    assert.equal(bus.suscripciones().length, 1);
    bus.emitir('vuelta:completada', vuelta());
    bus.emitir('vuelta:completada', vuelta());
    assert.equal(llamadas, 1);
    assert.equal(bus.suscripciones().length, 0);
  });

  it('cancelar deja de entregar y avisa si no existia', () => {
    const { bus } = crearBusDePrueba();
    let llamadas = 0;
    const sub = bus.suscribir('vuelta:completada', () => { llamadas += 1; });
    assert.equal(bus.existe(sub.id), true);
    assert.equal(sub.cancelar(), true);
    assert.equal(sub.cancelar(), false);
    bus.emitir('vuelta:completada', vuelta());
    assert.equal(llamadas, 0);
  });

  it('emitir sin suscriptores no falla y queda en el historial', () => {
    const { bus } = crearBusDePrueba();
    bus.emitir('sesion:abortada', DATOS_DE['sesion:abortada']);
    assert.equal(bus.estadisticas().enHistorial, 1);
    assert.equal(bus.estadisticas().entregas, 0);
  });

  it('rechaza eventos desconocidos, datos incompletos y manejadores que no son funciones', () => {
    const { bus } = crearBusDePrueba();
    assert.throws(() => bus.suscribir('nada', () => {}), /Evento desconocido/);
    assert.throws(() => bus.suscribir('vuelta:completada', 'x'), TypeError);
    assert.throws(() => bus.emitir('nada', {}), /Evento desconocido/);
    assert.throws(() => bus.emitir('vuelta:completada', { sesionId: 1 }), /Falta el campo vuelta/);
  });
});

describe('bus: limites', () => {
  it('no admite mas suscriptores que el maximo por evento', () => {
    const { bus } = crearBusDePrueba({ maxPorEvento: 2 });
    bus.suscribir('vuelta:completada', () => {});
    bus.suscribir('vuelta:completada', () => {});
    assert.throws(
      () => bus.suscribir('vuelta:completada', () => {}),
      rechazaCon('LIMITE_DE_SUSCRIPTORES', { evento: 'vuelta:completada', maximo: 2 }),
    );
    bus.suscribir('sesion:abortada', () => {});
  });

  it('las suscripciones internas no cuentan para el maximo', () => {
    const { bus } = crearBusDePrueba({ maxPorEvento: 1 });
    bus.suscribir('vuelta:completada', () => {}, { interna: true });
    bus.suscribir('vuelta:completada', () => {}, { interna: true });
    bus.suscribir('vuelta:completada', () => {});
    assert.throws(() => bus.suscribir('vuelta:completada', () => {}), rechazaCon('LIMITE_DE_SUSCRIPTORES'));
    assert.equal(bus.suscripciones().length, 3);
  });

  it('corta los bucles de eventos encadenados', () => {
    const { bus } = crearBusDePrueba({ profundidadMaxima: 3 });
    let nivel = 0;
    bus.suscribir('vuelta:completada', () => {
      nivel += 1;
      bus.emitir('vuelta:completada', vuelta());
    });
    bus.emitir('vuelta:completada', vuelta());
    assert.equal(nivel, 3);
    const [fallo] = bus.fallos();
    assert.match(fallo.mensaje, /profundidad maxima de 3/);
    assert.equal(bus.estadisticas().erroresDeListener, 1);
  });

  it('el historial conserva solo los eventos mas recientes', () => {
    const { bus } = crearBusDePrueba({ capacidadHistorial: 3 });
    for (let i = 0; i < 5; i += 1) bus.emitir('vuelta:completada', vuelta());
    assert.deepEqual(bus.consultar({}).data.map((e) => e.seq), [3, 4, 5]);
    assert.equal(bus.obtenerEvento(1), null);
    assert.equal(bus.obtenerEvento(4).seq, 4);
  });
});

describe('bus: errores en listeners', () => {
  it('un listener que falla no impide que los demas reciban el evento', () => {
    const { bus } = crearBusDePrueba();
    const recibidos = [];
    bus.suscribir('vuelta:completada', () => { throw new Error('boom'); }, { nombre: 'roto' });
    bus.suscribir('vuelta:completada', () => recibidos.push('sano'), { nombre: 'sano' });
    assert.doesNotThrow(() => bus.emitir('vuelta:completada', vuelta()));
    assert.deepEqual(recibidos, ['sano']);
    const [fallo] = bus.fallos();
    assert.deepEqual([fallo.nombre, fallo.evento, fallo.mensaje, fallo.seq], ['roto', 'vuelta:completada', 'boom', 1]);
  });

  it('el fallo se anuncia como evento listener:error', () => {
    const { bus } = crearBusDePrueba();
    const avisos = [];
    bus.suscribir('listener:error', (e) => avisos.push(e.datos));
    bus.suscribir('vuelta:completada', () => { throw new Error('boom'); }, { nombre: 'roto' });
    bus.emitir('vuelta:completada', vuelta());
    assert.equal(avisos.length, 1);
    assert.deepEqual([avisos[0].nombre, avisos[0].evento, avisos[0].mensaje], ['roto', 'vuelta:completada', 'boom']);
    assert.equal(bus.suscripciones().find((s) => s.nombre === 'roto').errores, 1);
  });

  it('un listener de listener:error que falla no provoca otra cascada', () => {
    const { bus } = crearBusDePrueba();
    bus.suscribir('listener:error', () => { throw new Error('el aviso tambien falla'); });
    bus.suscribir('vuelta:completada', () => { throw new Error('boom'); });
    bus.emitir('vuelta:completada', vuelta());
    assert.equal(bus.estadisticas().porEvento['listener:error'].emitidos, 1);
    assert.equal(bus.fallos().length, 2);
  });

  it('los rechazos de listeners asincronos tambien se registran', async () => {
    const { bus } = crearBusDePrueba();
    bus.suscribir('vuelta:completada', async () => {
      await pausa();
      throw new Error('fallo tardio');
    }, { nombre: 'asincrono' });
    bus.emitir('vuelta:completada', vuelta());
    assert.equal(bus.fallos().length, 0);
    await bus.esperarListeners();
    assert.equal(bus.fallos()[0].mensaje, 'fallo tardio');
  });

  it('esperarListeners espera a los listeners asincronos que si terminan bien', async () => {
    const { bus } = crearBusDePrueba();
    let terminado = false;
    bus.suscribir('vuelta:completada', async () => {
      await pausa();
      terminado = true;
    });
    bus.emitir('vuelta:completada', vuelta());
    assert.equal(terminado, false);
    await bus.esperarListeners();
    assert.equal(terminado, true);
  });

  it('solo conserva los ultimos fallos', () => {
    const { bus } = crearBusDePrueba();
    bus.suscribir('vuelta:completada', () => { throw new Error('boom'); });
    for (let i = 0; i < 60; i += 1) bus.emitir('vuelta:completada', vuelta());
    assert.equal(bus.fallos().length, 50);
    assert.equal(bus.estadisticas().erroresDeListener, 60);
  });
});

describe('bus: consulta del historial', () => {
  const lleno = () => {
    const entorno = crearBusDePrueba();
    entorno.bus.emitir('sesion:iniciada', DATOS_DE['sesion:iniciada']);
    entorno.bus.emitir('vuelta:completada', vuelta(1));
    entorno.bus.emitir('vuelta:completada', vuelta(2));
    entorno.bus.emitir('sesion:abortada', DATOS_DE['sesion:abortada']);
    return entorno.bus;
  };

  it('filtra por evento y por sesion', () => {
    const bus = lleno();
    assert.equal(bus.consultar({ evento: 'vuelta:completada' }).data.length, 2);
    assert.deepEqual(bus.consultar({ sesionId: 2 }).data.map((e) => e.seq), [3]);
  });

  it('pagina con un cursor', () => {
    const bus = lleno();
    const primera = bus.consultar({ limite: 3 });
    assert.deepEqual(primera.data.map((e) => e.seq), [1, 2, 3]);
    assert.equal(primera.siguiente, 3);
    const segunda = bus.consultar({ desde: primera.siguiente, limite: 3 });
    assert.deepEqual(segunda.data.map((e) => e.seq), [4]);
    assert.equal(segunda.siguiente, null);
  });

  it('las estadisticas cuentan emisiones y suscriptores por evento', () => {
    const bus = lleno();
    bus.suscribir('*', () => {});
    const stats = bus.estadisticas();
    assert.equal(stats.emitidos, 4);
    assert.equal(stats.porEvento['vuelta:completada'].emitidos, 2);
    assert.equal(stats.porEvento['*'].suscriptores, 1);
    assert.equal(stats.suscripciones, 1);
  });
});
