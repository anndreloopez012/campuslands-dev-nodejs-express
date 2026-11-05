import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { levantar } from '../soporte/cliente.js';

describe('API de la tabla de posiciones', () => {
  let cliente;

  beforeEach(async () => {
    cliente = await levantar(crearApp());
  });

  afterEach(() => cliente.cerrar());

  it('calcula la tabla de futbol con desempate por goles a favor', async () => {
    const { status, cuerpo } = await cliente.pedir('/tabla?modalidad=futbol');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo.data, [
      { posicion: 1, equipoId: 1, nombre: 'Leones', pj: 2, g: 2, e: 0, p: 0, gf: 5, gc: 2, dg: 3, pts: 6 },
      { posicion: 2, equipoId: 2, nombre: 'Tigres', pj: 2, g: 1, e: 0, p: 1, gf: 3, gc: 2, dg: 1, pts: 3 },
      { posicion: 3, equipoId: 3, nombre: 'Aguilas', pj: 2, g: 0, e: 1, p: 1, gf: 1, gc: 3, dg: -2, pts: 1 },
      { posicion: 4, equipoId: 4, nombre: 'Halcones', pj: 2, g: 0, e: 1, p: 1, gf: 0, gc: 2, dg: -2, pts: 1 },
    ]);
  });

  it('calcula la tabla de futbol sala por separado', async () => {
    const { cuerpo } = await cliente.pedir('/tabla?modalidad=futbol_sala');
    assert.deepEqual(cuerpo.data.map((f) => [f.nombre, f.pts, f.dg]), [['Rayos', 3, 2], ['Cometas', 1, 0], ['Furias', 1, 0], ['Truenos', 0, -2]]);
  });

  it('exige una modalidad valida y rechaza parametros ajenos', async () => {
    for (const consulta of ['', '?modalidad=rugby', '?modalidad=futbol&orden=pts', '?modalidad=futbol&modalidad=futbol_sala']) {
      const { status, cuerpo } = await cliente.pedir(`/tabla${consulta}`);
      assert.equal(status, 400, consulta);
      assert.equal(cuerpo.codigo, 'CONSULTA_INVALIDA');
    }
  });

  it('responde 405 con Allow', async () => {
    const { status, cabeceras } = await cliente.pedir('/tabla?modalidad=futbol', { method: 'POST' });
    assert.equal(status, 405);
    assert.equal(cabeceras.get('allow'), 'GET');
  });
});
