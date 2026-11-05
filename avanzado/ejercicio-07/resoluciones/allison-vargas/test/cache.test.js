import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Cache } from '../src/domain/cache.js';
import { MIN, SEG } from '../soporte/datos.js';
import { crearCacheDePrueba } from '../soporte/entorno.js';

describe('cache: lectura y escritura', () => {
  it('guarda un valor y lo devuelve mientras este fresco', () => {
    const { cache } = crearCacheDePrueba();
    cache.poner('a', { x: 1 }, { ttlMs: MIN });
    const lectura = cache.consultar('a');
    assert.deepEqual(lectura.valor, { x: 1 });
    assert.equal(lectura.obsoleto, false);
    assert.equal(lectura.restanteMs, MIN);
  });

  it('una clave ausente es un fallo', () => {
    const { cache } = crearCacheDePrueba();
    assert.equal(cache.consultar('nada'), null);
    assert.equal(cache.estadisticas().fallos, 1);
  });

  it('el valor vence cuando se cumple el ttl', () => {
    const { cache, avanzar } = crearCacheDePrueba();
    cache.poner('a', 1, { ttlMs: 10 * SEG });
    avanzar(9999);
    assert.equal(cache.consultar('a').valor, 1);
    avanzar(1);
    assert.equal(cache.consultar('a'), null);
    assert.equal(cache.estadisticas().expiradas, 1);
    assert.equal(cache.estadisticas().entradas, 0);
  });

  it('despues del ttl y dentro de la ventana de gracia el valor sale como obsoleto', () => {
    const { cache, avanzar } = crearCacheDePrueba();
    cache.poner('a', 1, { ttlMs: 10 * SEG, staleMs: 5 * SEG });
    avanzar(10 * SEG);
    const lectura = cache.consultar('a');
    assert.equal(lectura.obsoleto, true);
    assert.equal(lectura.restanteMs, 0);
    assert.equal(cache.estadisticas().obsoletos, 1);
    avanzar(5 * SEG);
    assert.equal(cache.consultar('a'), null);
  });

  it('sobrescribir una clave reinicia su vida y sus etiquetas', () => {
    const { cache, avanzar } = crearCacheDePrueba();
    cache.poner('a', 1, { ttlMs: 10 * SEG, etiquetas: ['uno'] });
    avanzar(8 * SEG);
    cache.poner('a', 2, { ttlMs: 10 * SEG, etiquetas: ['dos'] });
    avanzar(8 * SEG);
    assert.equal(cache.consultar('a').valor, 2);
    assert.equal(cache.invalidarEtiqueta('uno'), 0);
    assert.equal(cache.invalidarEtiqueta('dos'), 1);
  });

  it('espiar no cuenta aciertos ni cambia el orden de uso', () => {
    const { cache } = crearCacheDePrueba({ capacidad: 2 });
    cache.poner('a', 1, { ttlMs: MIN });
    cache.poner('b', 2, { ttlMs: MIN });
    assert.equal(cache.espiar('a').valor, 1);
    assert.equal(cache.espiar('x'), null);
    assert.equal(cache.estadisticas().consultas, 0);
    cache.poner('c', 3, { ttlMs: MIN });
    assert.equal(cache.espiar('a'), null);
  });

  it('rechaza parametros invalidos', () => {
    const { cache } = crearCacheDePrueba();
    assert.throws(() => cache.poner('a', 1, { ttlMs: 0 }), RangeError);
    assert.throws(() => cache.poner('a', 1, { ttlMs: 1.5 }), RangeError);
    assert.throws(() => cache.poner('a', 1, { ttlMs: 10, staleMs: -1 }), RangeError);
    assert.throws(() => new Cache({ capacidad: 0 }), RangeError);
  });
});

describe('cache: capacidad y desalojo', () => {
  it('al llenarse desaloja la entrada menos usada recientemente', () => {
    const { cache } = crearCacheDePrueba({ capacidad: 3 });
    for (const clave of ['a', 'b', 'c']) cache.poner(clave, clave, { ttlMs: MIN });
    cache.consultar('a');
    cache.poner('d', 'd', { ttlMs: MIN });
    assert.deepEqual(cache.claves().map((c) => c.clave), ['c', 'a', 'd']);
    assert.equal(cache.estadisticas().desalojadas, 1);
  });

  it('antes de desalojar descarta lo que ya vencio', () => {
    const { cache, avanzar } = crearCacheDePrueba({ capacidad: 2 });
    cache.poner('viejo', 1, { ttlMs: 5 * SEG });
    cache.poner('nuevo', 2, { ttlMs: MIN });
    avanzar(6 * SEG);
    cache.poner('otro', 3, { ttlMs: MIN });
    assert.deepEqual(cache.claves().map((c) => c.clave), ['nuevo', 'otro']);
    assert.equal(cache.estadisticas().desalojadas, 0);
    assert.equal(cache.estadisticas().expiradas, 1);
  });

  it('reescribir una clave existente no desaloja a otra', () => {
    const { cache } = crearCacheDePrueba({ capacidad: 2 });
    cache.poner('a', 1, { ttlMs: MIN });
    cache.poner('b', 2, { ttlMs: MIN });
    cache.poner('a', 3, { ttlMs: MIN });
    assert.equal(cache.estadisticas().desalojadas, 0);
    assert.equal(cache.estadisticas().entradas, 2);
  });
});

describe('cache: invalidacion', () => {
  const llenar = () => {
    const entorno = crearCacheDePrueba();
    entorno.cache.poner('auto:1', 1, { ttlMs: MIN, etiquetas: ['auto:1', 'listados'] });
    entorno.cache.poner('lista', 2, { ttlMs: MIN, etiquetas: ['listados'] });
    entorno.cache.poner('auto:2', 3, { ttlMs: MIN, etiquetas: ['auto:2'] });
    return entorno;
  };

  it('invalidar una etiqueta borra todas las claves que la tienen', () => {
    const { cache } = llenar();
    assert.equal(cache.invalidarEtiqueta('listados'), 2);
    assert.deepEqual(cache.claves().map((c) => c.clave), ['auto:2']);
    assert.equal(cache.invalidarEtiqueta('listados'), 0);
    assert.equal(cache.estadisticas().invalidadas, 2);
  });

  it('borrar una clave y vaciar todo', () => {
    const { cache } = llenar();
    assert.equal(cache.borrar('auto:2'), true);
    assert.equal(cache.borrar('auto:2'), false);
    assert.equal(cache.vaciar(), 2);
    assert.equal(cache.estadisticas().entradas, 0);
  });

  it('purgar quita solo lo vencido', () => {
    const { cache, avanzar } = crearCacheDePrueba();
    cache.poner('corta', 1, { ttlMs: 5 * SEG });
    cache.poner('larga', 2, { ttlMs: MIN });
    avanzar(10 * SEG);
    assert.equal(cache.purgar(), 1);
    assert.deepEqual(cache.claves().map((c) => c.clave), ['larga']);
  });

  it('la marca detecta invalidaciones ocurridas despues de tomarla', () => {
    const { cache } = crearCacheDePrueba();
    const marca = cache.marca('k', ['t']);
    assert.equal(cache.cambio(marca, 'k', ['t']), false);
    cache.invalidarEtiqueta('t');
    assert.equal(cache.cambio(marca, 'k', ['t']), true);
    const otra = cache.marca('k', ['t']);
    cache.borrar('k');
    assert.equal(cache.cambio(otra, 'k', ['t']), true);
    const ultima = cache.marca('k', []);
    cache.vaciar();
    assert.equal(cache.cambio(ultima, 'k', []), true);
  });
});

describe('cache: consulta de claves y estadisticas', () => {
  it('filtra por etiqueta y por prefijo sin mostrar el valor', () => {
    const { cache } = crearCacheDePrueba();
    cache.poner('auto:1', 'x', { ttlMs: MIN, etiquetas: ['auto:1'] });
    cache.poner('cotizacion:1', 'y', { ttlMs: MIN, etiquetas: ['auto:1'] });
    cache.poner('marca:ferrari', 'z', { ttlMs: MIN, etiquetas: ['marca:ferrari'] });
    assert.equal(cache.claves({ etiqueta: 'auto:1' }).length, 2);
    assert.deepEqual(cache.claves({ prefijo: 'marca' }).map((c) => c.clave), ['marca:ferrari']);
    assert.equal('valor' in cache.claves()[0], false);
    assert.deepEqual(cache.claves()[0].etiquetas, ['auto:1']);
  });

  it('calcula la tasa de acierto contando obsoletos como aciertos', () => {
    const { cache, avanzar } = crearCacheDePrueba();
    assert.equal(cache.estadisticas().tasaDeAcierto, null);
    cache.poner('a', 1, { ttlMs: 5 * SEG, staleMs: 5 * SEG });
    cache.consultar('a');
    cache.consultar('b');
    avanzar(6 * SEG);
    cache.consultar('a');
    cache.consultar('c');
    const stats = cache.estadisticas();
    assert.equal(stats.aciertos, 1);
    assert.equal(stats.obsoletos, 1);
    assert.equal(stats.fallos, 2);
    assert.equal(stats.tasaDeAcierto, 0.5);
  });
});
