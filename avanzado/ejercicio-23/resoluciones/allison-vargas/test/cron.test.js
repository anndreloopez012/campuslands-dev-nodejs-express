import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parsearCron, proximas, siguiente } from '../src/jobs/cron.js';

const JUEVES = new Date('2026-11-05T12:00:00.000Z');
const proxima = (expresion, desde = JUEVES) => siguiente(parsearCron(expresion), desde).toISOString();
const esInvalido = (expresion, motivo) => assert.throws(() => parsearCron(expresion), (e) => e.codigo === 'CRON_INVALIDO' && e.message.includes(motivo));

describe('parser de cron', () => {
  it('entiende comodines, listas, rangos, pasos y alias', () => {
    const c = parsearCron('*/15 6-8,20 1 */3 1-5');
    assert.deepEqual([...c.minuto], [0, 15, 30, 45]);
    assert.deepEqual([...c.hora], [6, 7, 8, 20]);
    assert.deepEqual([...c.mes], [1, 4, 7, 10]);
    assert.deepEqual([...c.diaSemana], [1, 2, 3, 4, 5]);
    assert.deepEqual([...parsearCron('5/20 * * * *').minuto], [5, 25, 45]);
    assert.equal(parsearCron('@daily').expresion, '0 0 * * *');
    assert.deepEqual([...parsearCron('0 0 * * 7').diaSemana], [0]);
    assert.deepEqual([...parsearCron('0 0 * * 5-7').diaSemana].sort(), [0, 5, 6]);
  });

  it('rechaza expresiones mal formadas con un motivo claro', () => {
    esInvalido('* * * *', '5 campos');
    esInvalido('60 * * * *', 'minuto fuera de rango');
    esInvalido('* 24 * * *', 'hora fuera de rango');
    esInvalido('* * 0 * *', 'dia fuera de rango');
    esInvalido('*/0 * * * *', 'paso invalido');
    esInvalido('5-1 * * * *', 'fuera de rango');
    esInvalido('a * * * *', 'valor no reconocido');
    esInvalido(null, 'debe ser texto');
  });
});

describe('siguiente ejecucion', () => {
  it('calcula la proxima ocurrencia en UTC', () => {
    assert.equal(proxima('*/15 * * * *', new Date('2026-11-05T12:07:30Z')), '2026-11-05T12:15:00.000Z');
    assert.equal(proxima('*/15 * * * *', new Date('2026-11-05T12:15:00Z')), '2026-11-05T12:30:00.000Z');
    assert.equal(proxima('0 7 * * *'), '2026-11-06T07:00:00.000Z');
    assert.equal(proxima('0 8 * * 1'), '2026-11-09T08:00:00.000Z');
    assert.equal(proxima('0 0 1 1 *'), '2027-01-01T00:00:00.000Z');
  });

  it('salta domingos y horas fuera del horario de taller', () => {
    assert.equal(proxima('*/30 6-20 * * 1-6', new Date('2026-11-07T20:45:00Z')), '2026-11-09T06:00:00.000Z');
    assert.equal(proxima('*/30 6-20 * * 1-6', new Date('2026-11-05T05:10:00Z')), '2026-11-05T06:00:00.000Z');
  });

  it('con dia del mes y dia de semana restringidos basta con que coincida uno', () => {
    assert.equal(proxima('0 0 13 * 5'), '2026-11-06T00:00:00.000Z');
    assert.equal(proxima('0 0 29 2 *'), '2028-02-29T00:00:00.000Z');
  });

  it('detecta expresiones que nunca ocurren y lista varias proximas', () => {
    assert.throws(() => proxima('0 0 31 2 *'), (e) => e.codigo === 'CRON_INVALIDO' && /no ocurre nunca/.test(e.message));
    assert.deepEqual(proximas('0 */6 * * *', JUEVES, 3), ['2026-11-05T18:00:00.000Z', '2026-11-06T00:00:00.000Z', '2026-11-06T06:00:00.000Z']);
  });
});
