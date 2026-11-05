import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearAlmacenIdempotencia } from '../src/idempotencia/almacen.js';
import { canonico, huellaDe } from '../src/idempotencia/middleware.js';
import { crearCandados } from '../src/services/estudio.service.js';
import { crearReloj } from '../soporte/api.js';

describe('almacen de claves', () => {
  it('guarda la respuesta y la entrega mientras este vigente', () => {
    const { reloj, avanzar } = crearReloj();
    const almacen = crearAlmacenIdempotencia({ reloj });
    almacen.reservar('c1', 'clave-123', 'h1');
    assert.equal(almacen.obtener('c1', 'clave-123').estado, 'en_proceso');
    assert.equal(almacen.obtener('c2', 'clave-123'), null);
    almacen.completar('c1', 'clave-123', { status: 201, cabeceras: {}, cuerpo: '{}' });
    avanzar(24 * 60 * 60 * 1000 - 1);
    assert.equal(almacen.obtener('c1', 'clave-123').respuesta.status, 201);
    avanzar(1);
    assert.equal(almacen.obtener('c1', 'clave-123'), null);
    assert.equal(almacen.tamano, 0);
  });

  it('libera un bloqueo colgado y purga lo vencido', () => {
    const { reloj, avanzar } = crearReloj();
    const almacen = crearAlmacenIdempotencia({ reloj });
    almacen.reservar('c1', 'colgada', 'h');
    almacen.reservar('c1', 'lista', 'h');
    almacen.completar('c1', 'lista', { status: 200 });
    avanzar(30_000);
    assert.equal(almacen.obtener('c1', 'colgada'), null);
    assert.equal(almacen.obtener('c1', 'lista').estado, 'completada');
    almacen.reservar('c1', 'otra', 'h');
    avanzar(30_000);
    assert.equal(almacen.purgar(), 1);
    almacen.liberar('c1', 'lista');
    assert.equal(almacen.tamano, 0);
    almacen.completar('c1', 'no-existe', {});
  });
});

describe('huella de la peticion', () => {
  it('no depende del orden de las claves pero si del contenido, metodo y ruta', () => {
    assert.equal(canonico({ b: [1, { d: 1, c: 2 }], a: null }), '{"a":null,"b":[1,{"c":2,"d":1}]}');
    assert.equal(canonico(undefined), 'null');
    const req = (body, path = '/pagos', method = 'POST') => ({
      method, baseUrl: '/base', path, body,
    });
    assert.equal(huellaDe(req({ a: 1, b: 2 })), huellaDe(req({ b: 2, a: 1 })));
    assert.notEqual(huellaDe(req({ a: 1 })), huellaDe(req({ a: 2 })));
    assert.notEqual(huellaDe(req({ a: 1 })), huellaDe(req({ a: 1 }, '/comisiones')));
    assert.notEqual(huellaDe(req({ a: 1 })), huellaDe(req({ a: 1 }, '/pagos', 'PUT')));
  });
});

describe('candados por clave', () => {
  it('ejecuta en serie las tareas de la misma clave y en paralelo las de otras', async () => {
    const candado = crearCandados();
    const orden = [];
    const tarea = (nombre, ms) => () => new Promise((r) => {
      orden.push(`inicio ${nombre}`);
      setTimeout(() => { orden.push(`fin ${nombre}`); r(nombre); }, ms);
    });
    const fallida = () => Promise.reject(new Error('x'));
    const resultados = await Promise.allSettled([
      candado(1, tarea('a', 20)), candado(1, fallida), candado(1, tarea('b', 1)), candado(2, tarea('c', 1)),
    ]);
    assert.deepEqual(resultados.map((r) => r.status), ['fulfilled', 'rejected', 'fulfilled', 'fulfilled']);
    assert.ok(orden.indexOf('fin a') < orden.indexOf('inicio b'));
    assert.ok(orden.indexOf('inicio c') < orden.indexOf('fin a'));
  });
});
