import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { crearContenedor } from '../src/core/contenedor.js';

describe('contenedor de dependencias', () => {
  it('crea cada dependencia una sola vez y solo cuando se pide', () => {
    const contenedor = crearContenedor();
    const fabrica = mock.fn(() => ({ id: 1 }));
    contenedor.registrar('servicio', fabrica);
    assert.equal(fabrica.mock.callCount(), 0);
    assert.equal(contenedor.resolver('servicio'), contenedor.resolver('servicio'));
    assert.equal(fabrica.mock.callCount(), 1);
  });

  it('la fabrica recibe el contenedor para pedir otras dependencias', () => {
    const contenedor = crearContenedor();
    contenedor.registrar('base', () => 10);
    contenedor.registrar('doble', (c) => c.resolver('base') * 2);
    assert.equal(contenedor.resolver('doble'), 20);
  });

  it('falla con un mensaje claro si la dependencia no existe', () => {
    assert.throws(() => crearContenedor().resolver('nada'), /Dependencia no registrada: nada/);
  });

  it('detecta dependencias circulares y muestra el camino', () => {
    const contenedor = crearContenedor();
    contenedor.registrar('a', (c) => c.resolver('b'));
    contenedor.registrar('b', (c) => c.resolver('c'));
    contenedor.registrar('c', (c) => c.resolver('a'));
    assert.throws(() => contenedor.resolver('a'), /Dependencia circular: a -> b -> c -> a/);
    assert.throws(() => contenedor.resolver('b'), /Dependencia circular: b -> c -> a -> b/);
  });

  it('no deja una dependencia a medias despues de un fallo', () => {
    const contenedor = crearContenedor();
    let fallar = true;
    contenedor.registrar('inestable', () => {
      if (fallar) throw new Error('no arranco');
      return 'listo';
    });
    assert.throws(() => contenedor.resolver('inestable'), /no arranco/);
    fallar = false;
    assert.equal(contenedor.resolver('inestable'), 'listo');
  });

  it('no permite registrar dos veces el mismo nombre ni fabricas invalidas', () => {
    const contenedor = crearContenedor();
    contenedor.registrar('x', () => 1);
    assert.throws(() => contenedor.registrar('x', () => 2), /ya esta registrada/);
    assert.throws(() => contenedor.registrar('y', 5), /funcion fabrica/);
  });

  it('permite reemplazar antes de resolver y lo prohibe despues', () => {
    const contenedor = crearContenedor();
    contenedor.registrar('x', () => 'real');
    contenedor.reemplazar('x', () => 'falso');
    assert.equal(contenedor.resolver('x'), 'falso');
    assert.throws(() => contenedor.reemplazar('x', () => 'otro'), /ya fue resuelta/);
    assert.throws(() => contenedor.reemplazar('z', () => 1), /no esta registrada/);
  });

  it('lista los nombres registrados', () => {
    const contenedor = crearContenedor();
    contenedor.registrar('a', () => 1);
    contenedor.registrar('b', () => 2);
    assert.deepEqual(contenedor.nombres(), ['a', 'b']);
    assert.equal(contenedor.tiene('a'), true);
    assert.equal(contenedor.tiene('c'), false);
  });
});
