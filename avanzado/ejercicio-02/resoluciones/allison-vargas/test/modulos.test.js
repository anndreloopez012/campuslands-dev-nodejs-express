import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Router } from 'express';
import { ordenarModulos } from '../src/core/modulos.js';
import { MODULOS } from '../src/modulos/index.js';

const falso = (nombre, extra = {}) => ({
  nombre,
  ruta: `/${nombre}`,
  registrar() {},
  crearRouter: () => Router(),
  ...extra,
});

describe('orden y validacion de modulos', () => {
  it('los modulos reales se cargan con jugadores primero', () => {
    const nombres = ordenarModulos(MODULOS).map((m) => m.nombre);
    assert.deepEqual(nombres, ['jugadores', 'partidas', 'clasificacion']);
  });

  it('ordena por dependencias sin importar el orden declarado', () => {
    const c = falso('c', { dependencias: ['b'] });
    const b = falso('b', { dependencias: ['a'] });
    const a = falso('a');
    assert.deepEqual(ordenarModulos([c, b, a]).map((m) => m.nombre), ['a', 'b', 'c']);
  });

  it('no repite un modulo que varios necesitan', () => {
    const base = falso('base');
    const x = falso('x', { dependencias: ['base'] });
    const y = falso('y', { dependencias: ['base'] });
    assert.deepEqual(ordenarModulos([x, y, base]).map((m) => m.nombre), ['base', 'x', 'y']);
  });

  it('rechaza dependencias que no existen', () => {
    assert.throws(
      () => ordenarModulos([falso('a', { dependencias: ['fantasma'] })]),
      /a depende de fantasma, que no esta registrado/,
    );
  });

  it('rechaza ciclos mostrando el camino', () => {
    const a = falso('a', { dependencias: ['b'] });
    const b = falso('b', { dependencias: ['a'] });
    assert.throws(() => ordenarModulos([a, b]), /Dependencia circular entre modulos: a -> b -> a/);
  });

  it('rechaza nombres y rutas repetidos', () => {
    assert.throws(() => ordenarModulos([falso('a'), falso('a')]), /Modulo duplicado: a/);
    assert.throws(
      () => ordenarModulos([falso('a'), falso('b', { ruta: '/a' })]),
      /La ruta \/a ya la usa otro modulo/,
    );
  });

  it('rechaza modulos mal formados', () => {
    assert.throws(() => ordenarModulos([{}]), /necesita un nombre/);
    assert.throws(() => ordenarModulos([falso('a', { ruta: 'a' })]), /ruta con forma/);
    assert.throws(() => ordenarModulos([falso('a', { ruta: '/A/b' })]), /ruta con forma/);
    assert.throws(() => ordenarModulos([falso('a', { crearRouter: undefined })]), /registrar y crearRouter/);
  });
});
