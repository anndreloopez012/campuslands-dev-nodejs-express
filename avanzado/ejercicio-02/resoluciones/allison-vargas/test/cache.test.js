import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { crearCache } from '../src/core/cache.js';
import { crearReloj } from '../soporte/api.js';

function diferido() {
  let resolver;
  let rechazar;
  const promesa = new Promise((res, rej) => {
    resolver = res;
    rechazar = rej;
  });
  return { promesa, resolver, rechazar };
}

describe('cache con TTL', () => {
  it('calcula una vez y luego responde desde la cache', async () => {
    const cache = crearCache({ reloj: crearReloj() });
    const calcular = mock.fn(() => 42);
    assert.deepEqual(await cache.consultar('k', calcular), { valor: 42, acierto: false });
    assert.deepEqual(await cache.consultar('k', calcular), { valor: 42, acierto: true });
    assert.equal(calcular.mock.callCount(), 1);
  });

  it('recalcula cuando vence el TTL', async () => {
    const reloj = crearReloj();
    const cache = crearCache({ reloj, ttlMs: 1000 });
    let n = 0;
    const calcular = () => (n += 1);
    await cache.consultar('k', calcular);
    reloj.avanzar(999);
    assert.equal((await cache.consultar('k', calcular)).valor, 1);
    reloj.avanzar(1);
    assert.deepEqual(await cache.consultar('k', calcular), { valor: 2, acierto: false });
    assert.equal(cache.estadisticas().expiradas, 1);
  });

  it('permite un TTL propio por consulta', async () => {
    const reloj = crearReloj();
    const cache = crearCache({ reloj, ttlMs: 10000 });
    let n = 0;
    await cache.consultar('k', () => (n += 1), 100);
    reloj.avanzar(100);
    assert.equal((await cache.consultar('k', () => (n += 1), 100)).valor, 2);
  });

  it('expulsa la entrada menos usada al superar el maximo', async () => {
    const cache = crearCache({ reloj: crearReloj(), maxEntradas: 2 });
    await cache.consultar('a', () => 1);
    await cache.consultar('b', () => 2);
    await cache.consultar('a', () => 1);
    await cache.consultar('c', () => 3);
    assert.equal(cache.tamano(), 2);
    assert.equal((await cache.consultar('a', () => 99)).acierto, true);
    assert.equal((await cache.consultar('b', () => 99)).acierto, false);
    assert.ok(cache.estadisticas().expulsadas >= 1);
  });

  it('varias consultas simultaneas comparten un solo calculo', async () => {
    const cache = crearCache({ reloj: crearReloj() });
    const espera = diferido();
    const calcular = mock.fn(() => espera.promesa);
    const consultas = [cache.consultar('k', calcular), cache.consultar('k', calcular), cache.consultar('k', calcular)];
    espera.resolver('listo');
    const resultados = await Promise.all(consultas);
    assert.equal(calcular.mock.callCount(), 1);
    assert.deepEqual(resultados.map((r) => r.valor), ['listo', 'listo', 'listo']);
    assert.equal((await cache.consultar('k', calcular)).acierto, true);
  });

  it('no guarda un valor calculado antes de una invalidacion', async () => {
    const cache = crearCache({ reloj: crearReloj() });
    const espera = diferido();
    const primera = cache.consultar('k', () => espera.promesa);
    cache.borrar('k');
    espera.resolver('viejo');
    assert.equal((await primera).valor, 'viejo');
    assert.deepEqual(await cache.consultar('k', () => 'nuevo'), { valor: 'nuevo', acierto: false });
  });

  it('no guarda los errores y los comparte con quien esperaba', async () => {
    const cache = crearCache({ reloj: crearReloj() });
    const espera = diferido();
    const a = cache.consultar('k', () => espera.promesa);
    const b = cache.consultar('k', () => 'no se usa');
    espera.rechazar(new Error('fallo'));
    await assert.rejects(a, /fallo/);
    await assert.rejects(b, /fallo/);
    assert.deepEqual(await cache.consultar('k', () => 'ok'), { valor: 'ok', acierto: false });
  });

  it('borra por clave, por prefijo y todo', async () => {
    const cache = crearCache({ reloj: crearReloj() });
    for (const clave of ['a:1', 'a:2', 'b:1']) await cache.consultar(clave, () => clave);
    assert.equal(cache.borrar('b:1'), true);
    assert.equal(cache.borrar('b:1'), false);
    assert.equal(cache.borrarPrefijo('a:'), 2);
    assert.equal(cache.tamano(), 0);
    await cache.consultar('x', () => 1);
    cache.limpiar();
    assert.equal(cache.tamano(), 0);
  });

  it('cuenta aciertos y fallos', async () => {
    const cache = crearCache({ reloj: crearReloj() });
    await cache.consultar('k', () => 1);
    await cache.consultar('k', () => 1);
    await cache.consultar('k', () => 1);
    assert.deepEqual(cache.estadisticas(), { aciertos: 2, fallos: 1, expiradas: 0, expulsadas: 0, entradas: 1 });
  });
});
