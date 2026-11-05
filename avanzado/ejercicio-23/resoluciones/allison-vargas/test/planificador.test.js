import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearPlanificador } from '../src/jobs/planificador.js';

const MIN = 60 * 1000;

function entorno() {
  let actual = Date.parse('2026-11-05T12:00:00.000Z');
  const reloj = () => new Date(actual);
  const registros = [];
  return {
    reloj,
    avanzar: (ms) => { actual += ms; },
    registros,
    planificador: crearPlanificador({ reloj, registro: (r) => registros.push(r) }),
  };
}

describe('planificador', () => {
  it('ejecuta cuando vence, guarda historial y agenda la siguiente', async () => {
    const { planificador, avanzar, registros } = entorno();
    let corridas = 0;
    planificador.registrar({ nombre: 'cada-diez', cron: '*/10 * * * *', tarea: () => { corridas += 1; return { corridas }; } });
    assert.equal(planificador.obtener('cada-diez').proximaEjecucion, '2026-11-05T12:10:00.000Z');
    assert.deepEqual(await planificador.tick(), []);
    avanzar(10 * MIN);
    const [resultado] = await planificador.tick();
    assert.deepEqual([resultado.resultado, resultado.origen, resultado.programada], ['exito', 'cron', '2026-11-05T12:10:00.000Z']);
    assert.deepEqual(resultado.detalle, { corridas: 1 });
    assert.equal(planificador.obtener('cada-diez').proximaEjecucion, '2026-11-05T12:20:00.000Z');
    assert.equal(registros.length, 1);
    assert.throws(() => planificador.registrar({ nombre: 'cada-diez', cron: '* * * * *', tarea: () => {} }), TypeError);
  });

  it('si se perdieron varias ejecuciones corre una sola vez', async () => {
    const { planificador, avanzar } = entorno();
    let corridas = 0;
    planificador.registrar({ nombre: 'horaria', cron: '@hourly', tarea: () => { corridas += 1; } });
    avanzar(5 * 60 * MIN + 7 * MIN);
    await planificador.tick();
    await planificador.tick();
    assert.equal(corridas, 1);
    assert.equal(planificador.obtener('horaria').proximaEjecucion, '2026-11-05T18:00:00.000Z');
  });

  it('no se solapa: si sigue corriendo, la siguiente se omite', async () => {
    const { planificador, avanzar } = entorno();
    let terminar;
    planificador.registrar({ nombre: 'lenta', cron: '* * * * *', tarea: () => new Promise((r) => { terminar = r; }) });
    avanzar(MIN);
    const primera = planificador.tick();
    await new Promise((r) => { setImmediate(r); });
    assert.equal(planificador.obtener('lenta').ejecutando, true);
    avanzar(MIN);
    await planificador.tick();
    await assert.rejects(planificador.ejecutarAhora('lenta'), (e) => e.codigo === 'JOB_EN_EJECUCION');
    terminar('listo');
    await primera;
    const historial = planificador.historial('lenta');
    assert.deepEqual(historial.map((h) => h.resultado), ['exito', 'omitida']);
    assert.deepEqual(planificador.obtener('lenta').ejecuciones, { omitida: 1, exito: 1 });
  });

  it('corta por timeout, avisa con la senal y registra errores', async () => {
    const { planificador } = entorno();
    let senal;
    planificador.registrar({
      nombre: 'colgada', cron: '@daily', timeoutMs: 20, tarea: ({ signal }) => { senal = signal; return new Promise(() => {}); },
    });
    planificador.registrar({ nombre: 'rota', cron: '@daily', tarea: () => { throw new Error('sin conexion al ERP'); } });
    const t = await planificador.ejecutarAhora('colgada');
    assert.deepEqual([t.resultado, t.detalle, t.origen], ['timeout', 'supero 20 ms', 'manual']);
    assert.equal(senal.aborted, true);
    const e = await planificador.ejecutarAhora('rota');
    assert.deepEqual([e.resultado, e.detalle], ['error', 'sin conexion al ERP']);
  });

  it('pausa y reanuda recalculando desde el momento de reanudar', async () => {
    const { planificador, avanzar } = entorno();
    let corridas = 0;
    planificador.registrar({ nombre: 'diaria', cron: '0 7 * * *', tarea: () => { corridas += 1; } });
    assert.equal(planificador.pausar('diaria').proximaEjecucion, null);
    avanzar(2 * 24 * 60 * MIN);
    await planificador.tick();
    assert.equal(corridas, 0);
    assert.equal(planificador.reanudar('diaria').proximaEjecucion, '2026-11-08T07:00:00.000Z');
    assert.throws(() => planificador.obtener('no-existe'), (e) => e.codigo === 'JOB_NO_ENCONTRADO');
  });
});
