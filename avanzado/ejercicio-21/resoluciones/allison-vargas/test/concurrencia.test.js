import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearSemaforo, crearSingleFlight } from '../src/concurrencia/semaforo.js';
import { crearGranja } from '../src/concurrencia/granja.js';
import { crearRenderizadorManual, esperarHasta, tick } from '../soporte/renderizador.js';

const reloj = () => new Date('2026-11-05T12:00:00.000Z');

describe('semaforo', () => {
  it('deja pasar hasta el maximo y atiende la espera en orden', async () => {
    const semaforo = crearSemaforo(2);
    const a = await semaforo.adquirir();
    await semaforo.adquirir();
    const orden = [];
    const c = semaforo.adquirir().then((liberar) => { orden.push('c'); return liberar; });
    const d = semaforo.adquirir().then((liberar) => { orden.push('d'); return liberar; });
    assert.deepEqual([semaforo.enUso, semaforo.enEspera], [2, 2]);
    a();
    a();
    await c;
    assert.deepEqual(orden, ['c']);
    assert.deepEqual([semaforo.enUso, semaforo.enEspera], [2, 1]);
    (await c)();
    await d;
    assert.deepEqual(orden, ['c', 'd']);
    assert.throws(() => crearSemaforo(0), TypeError);
  });

  it('una espera cancelada sale de la fila', async () => {
    const semaforo = crearSemaforo(1);
    const liberar = await semaforo.adquirir();
    const controlador = new AbortController();
    const esperando = semaforo.adquirir({ signal: controlador.signal });
    controlador.abort(new Error('ya no'));
    await assert.rejects(esperando, /ya no/);
    assert.equal(semaforo.enEspera, 0);
    await assert.rejects(semaforo.adquirir({ signal: controlador.signal }), /ya no/);
    liberar();
    assert.equal(semaforo.enUso, 0);
  });
});

describe('single flight', () => {
  it('comparte un calculo entre llamadas simultaneas y recalcula despues', async () => {
    const unaVez = crearSingleFlight();
    let calculos = 0;
    const calcular = async () => {
      calculos += 1;
      await tick();
      return calculos;
    };
    const resultados = await Promise.all([unaVez('k', calcular), unaVez('k', calcular), unaVez('otra', calcular)]);
    assert.deepEqual(resultados, [2, 2, 2]);
    assert.equal(calculos, 2);
    assert.equal(await unaVez('k', calcular), 3);
    await assert.rejects(unaVez('mala', () => { throw new Error('x'); }), /x/);
    assert.equal(await unaVez('mala', async () => 'ok'), 'ok');
  });
});

describe('granja de render', () => {
  function granja(limites) {
    const manual = crearRenderizadorManual();
    return {
      manual,
      granja: crearGranja({
        renderizar: manual.renderizar, reloj, limites: { simultaneos: 1, enCola: 1, porCliente: 2, timeoutMs: 1000, ...limites },
      }),
    };
  }
  const datos = { escenaId: 1, calidad: 'final', frames: 10 };

  it('procesa de a uno, informa la posicion y aplica limites', async () => {
    const { granja: g, manual } = granja();
    const a = g.encolar('ana', datos);
    const b = g.encolar('beto', datos);
    await tick();
    assert.equal(g.obtener(a.id).estado, 'renderizando');
    assert.deepEqual([g.obtener(b.id).estado, g.obtener(b.id).posicion], ['en_cola', 1]);
    assert.throws(() => g.encolar('carla', datos), (e) => e.codigo === 'COLA_LLENA' && e.cabeceras['Retry-After'] === '10');
    manual.control(a.id).progreso(42.4);
    assert.equal(g.obtener(a.id).progreso, 42);
    manual.control(a.id).completar();
    await esperarHasta(() => g.obtener(b.id).estado === 'renderizando');
    assert.equal(g.obtener(a.id).estado, 'completado');
    assert.equal(g.obtener(a.id).progreso, 100);
    assert.equal(g.obtener(a.id).resultado.archivo, `render-${a.id}.mp4`);
    assert.equal(g.estadisticas().porEstado.completado, 1);
  });

  it('limita los renders activos por cliente', async () => {
    const { granja: g } = granja({ simultaneos: 3, enCola: 5 });
    g.encolar('ana', datos);
    g.encolar('ana', datos);
    assert.throws(() => g.encolar('ana', datos), (e) => e.codigo === 'LIMITE_POR_CLIENTE');
    assert.doesNotThrow(() => g.encolar('beto', datos));
  });

  it('cancela en cola o en curso, y solo su duenio', async () => {
    const { granja: g, manual } = granja({ enCola: 2 });
    const a = g.encolar('ana', datos);
    const b = g.encolar('ana', datos);
    await tick();
    assert.throws(() => g.cancelar(b.id, 'beto'), (e) => e.codigo === 'RENDER_NO_ENCONTRADO');
    assert.equal(g.cancelar(b.id, 'ana').estado, 'cancelado');
    g.cancelar(a.id, 'ana');
    await esperarHasta(() => g.obtener(a.id).estado === 'cancelado');
    assert.throws(() => g.cancelar(a.id, 'ana'), (e) => e.codigo === 'RENDER_TERMINADO');
    assert.equal(manual.enCurso.size, 1);
    const c = g.encolar('ana', datos);
    await esperarHasta(() => g.obtener(c.id).estado === 'renderizando');
  });

  it('marca expirados los que superan el tiempo y fallidos los que revientan', async () => {
    const { granja: g, manual } = granja({ timeoutMs: 30, simultaneos: 2 });
    const lento = g.encolar('ana', datos);
    const roto = g.encolar('beto', datos);
    await tick();
    manual.control(roto.id).fallar('textura corrupta');
    await esperarHasta(() => g.obtener(lento.id).estado === 'expirado');
    assert.equal(g.obtener(lento.id).error, 'supero 30 ms');
    assert.deepEqual([g.obtener(roto.id).estado, g.obtener(roto.id).error], ['fallido', 'textura corrupta']);
    assert.throws(() => g.obtener(99), (e) => e.codigo === 'RENDER_NO_ENCONTRADO');
  });
});
