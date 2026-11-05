import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearLogger, serializarError } from '../src/observabilidad/logger.js';
import { REDACTADO, crearRedactor } from '../src/observabilidad/redaccion.js';
import { crearMemoria } from '../src/observabilidad/destinos.js';

const reloj = () => new Date('2026-11-05T12:00:00.000Z');

function loggerDePrueba(opciones = {}) {
  const entradas = [];
  const logger = crearLogger({ reloj, destinos: [(e) => entradas.push(e)], ...opciones });
  return { logger, entradas };
}

describe('logger', () => {
  it('escribe entradas JSON con tiempo, nivel, mensaje y datos', () => {
    const { logger, entradas } = loggerDePrueba({ contexto: { servicio: 'flota' } });
    logger.info('mision.creada', { misionId: 3 });
    assert.deepEqual(entradas, [{
      tiempo: '2026-11-05T12:00:00.000Z', nivel: 'info', mensaje: 'mision.creada', servicio: 'flota', misionId: 3,
    }]);
  });

  it('filtra por nivel minimo y permite cambiarlo en caliente', () => {
    const { logger, entradas } = loggerDePrueba({ nivel: 'warn' });
    logger.debug('a');
    logger.info('b');
    logger.warn('c');
    logger.error('d');
    assert.deepEqual(entradas.map((e) => e.mensaje), ['c', 'd']);
    assert.equal(logger.habilitado('info'), false);
    assert.equal(logger.cambiarNivel('debug'), 'warn');
    logger.debug('e');
    assert.equal(entradas.at(-1).mensaje, 'e');
    assert.throws(() => logger.cambiarNivel('verbose'), TypeError);
    assert.throws(() => crearLogger({ nivel: 'todo' }), TypeError);
  });

  it('los hijos heredan contexto y comparten el nivel del padre', () => {
    const { logger, entradas } = loggerDePrueba({ contexto: { servicio: 'flota' } });
    const hijo = logger.hijo({ requestId: 'abc12345' });
    const nieto = hijo.hijo({ misionId: 1 });
    nieto.info('x');
    assert.deepEqual(entradas[0], {
      tiempo: entradas[0].tiempo, nivel: 'info', mensaje: 'x', servicio: 'flota', requestId: 'abc12345', misionId: 1,
    });
    logger.cambiarNivel('error');
    nieto.warn('silenciado');
    assert.equal(entradas.length, 1);
    assert.deepEqual(hijo.contexto, { servicio: 'flota', requestId: 'abc12345' });
  });

  it('serializa errores con codigo, pila y causa', () => {
    const causa = new Error('disco lleno');
    const error = new Error('no se pudo guardar', { cause: causa });
    error.codigo = 'X';
    const { logger, entradas } = loggerDePrueba();
    logger.error('fallo', { error });
    assert.equal(entradas[0].error.mensaje, 'no se pudo guardar');
    assert.equal(entradas[0].error.codigo, 'X');
    assert.match(entradas[0].error.pila, /no se pudo guardar/);
    assert.equal(entradas[0].error.causa.mensaje, 'disco lleno');
    assert.equal(serializarError('texto'), 'texto');
  });

  it('un destino que falla no impide escribir en los demas', () => {
    const fallos = [];
    const buenas = [];
    const logger = crearLogger({
      reloj,
      destinos: [() => { throw new Error('roto'); }, (e) => buenas.push(e)],
      alFallarDestino: (e) => fallos.push(e.message),
    });
    logger.info('hola');
    assert.equal(buenas.length, 1);
    assert.deepEqual(fallos, ['roto']);
  });
});

describe('redaccion', () => {
  const { redactar, redactarUrl } = crearRedactor();

  it('oculta claves sensibles sin importar mayusculas ni guiones, a cualquier profundidad', () => {
    const salida = redactar({
      usuario: 'ana',
      Password: '123',
      headers: { Authorization: 'Bearer x', 'x-api-key': 'k', accept: 'json' },
      lista: [{ refresh_token: 'r' }],
    });
    assert.deepEqual(salida, {
      usuario: 'ana',
      Password: REDACTADO,
      headers: { Authorization: REDACTADO, 'x-api-key': REDACTADO, accept: 'json' },
      lista: [{ refresh_token: REDACTADO }],
    });
  });

  it('soporta ciclos, profundidad excesiva, fechas, bigint y textos largos', () => {
    const ciclo = { nombre: 'a' };
    ciclo.yo = ciclo;
    assert.deepEqual(redactar(ciclo), { nombre: 'a', yo: '[Circular]' });
    const profundo = { a: { b: { c: { d: { e: { f: { g: 1 } } } } } } };
    assert.equal(redactar(profundo).a.b.c.d.e.f, '[Profundo]');
    assert.equal(redactar({ f: new Date(0) }).f, '1970-01-01T00:00:00.000Z');
    assert.equal(redactar({ n: 10n }).n, '10');
    assert.match(redactar('x'.repeat(2500)), /\.\.\.\[500 mas\]$/);
    const repetido = { a: 1 };
    assert.deepEqual(redactar({ x: repetido, y: repetido }), { x: { a: 1 }, y: { a: 1 } });
  });

  it('redacta parametros sensibles de una url', () => {
    assert.equal(redactarUrl('/a?token=abc&x=1'), `/a?token=${REDACTADO}&x=1`);
    assert.equal(redactarUrl('/a?api%5Fkey=abc'), `/a?api%5Fkey=${REDACTADO}`);
    assert.equal(redactarUrl('/a?%E0=1'), '/a?%E0=1');
    assert.equal(redactarUrl('/a'), '/a');
  });
});

describe('memoria de logs', () => {
  it('guarda hasta su capacidad y descarta las mas antiguas', () => {
    const memoria = crearMemoria({ capacidad: 3 });
    for (let i = 1; i <= 5; i += 1) memoria.destino({ nivel: i % 2 ? 'info' : 'error', mensaje: `m${i}` });
    const { data, total } = memoria.consultar();
    assert.equal(total, 3);
    assert.deepEqual(data.map((e) => e.mensaje), ['m5', 'm4', 'm3']);
    assert.deepEqual(memoria.estadisticas(), {
      capacidad: 3, guardadas: 3, recibidas: 5, descartadas: 2, porNivel: { debug: 0, info: 2, warn: 0, error: 1 },
    });
  });

  it('filtra por nivel minimo, requestId, texto y limite', () => {
    const memoria = crearMemoria();
    memoria.destino({ nivel: 'debug', mensaje: 'telemetria', requestId: 'a' });
    memoria.destino({ nivel: 'warn', mensaje: 'mision.fallida', requestId: 'a' });
    memoria.destino({ nivel: 'info', mensaje: 'mision.creada', requestId: 'b' });
    assert.equal(memoria.consultar({ nivel: 'info' }).total, 2);
    assert.equal(memoria.consultar({ requestId: 'a' }).total, 2);
    assert.equal(memoria.consultar({ mensaje: 'mision' }).total, 2);
    assert.equal(memoria.consultar({ limite: 1 }).data[0].mensaje, 'mision.creada');
    assert.equal(memoria.limpiar(), 3);
    assert.equal(memoria.consultar().total, 0);
    assert.throws(() => crearMemoria({ capacidad: 0 }), TypeError);
  });
});
