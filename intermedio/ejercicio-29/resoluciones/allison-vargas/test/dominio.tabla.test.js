import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calcularTabla } from '../src/domain/tabla.js';

const equipo = (id, nombre) => ({ id, nombre, modalidad: 'futbol' });
const partido = (localId, visitanteId, golesLocal, golesVisitante) => ({ localId, visitanteId, golesLocal, golesVisitante });

describe('calculo de la tabla de posiciones', () => {
  const equipos = [equipo(1, 'Leones'), equipo(2, 'Tigres'), equipo(3, 'Aguilas')];

  it('devuelve ceros para todos cuando no hay partidos y ordena por nombre', () => {
    const tabla = calcularTabla(equipos, []);
    assert.deepEqual(tabla.map((f) => f.nombre), ['Aguilas', 'Leones', 'Tigres']);
    assert.deepEqual(tabla.map((f) => f.posicion), [1, 2, 3]);
    assert.ok(tabla.every((f) => f.pj === 0 && f.pts === 0 && f.dg === 0));
  });

  it('da 3 puntos por victoria, 1 por empate y 0 por derrota', () => {
    const tabla = calcularTabla(equipos, [partido(1, 2, 2, 1), partido(2, 3, 0, 0)]);
    const por = Object.fromEntries(tabla.map((f) => [f.nombre, f]));
    assert.deepEqual(
      { g: por.Leones.g, e: por.Leones.e, p: por.Leones.p, pts: por.Leones.pts },
      { g: 1, e: 0, p: 0, pts: 3 },
    );
    assert.deepEqual({ g: por.Tigres.g, e: por.Tigres.e, p: por.Tigres.p, pts: por.Tigres.pts }, { g: 0, e: 1, p: 1, pts: 1 });
    assert.equal(por.Aguilas.pts, 1);
  });

  it('suma goles a favor y en contra tanto de local como de visitante', () => {
    const tabla = calcularTabla(equipos, [partido(1, 2, 3, 1), partido(2, 1, 2, 2)]);
    const leones = tabla.find((f) => f.nombre === 'Leones');
    assert.deepEqual([leones.pj, leones.gf, leones.gc, leones.dg], [2, 5, 3, 2]);
    const tigres = tabla.find((f) => f.nombre === 'Tigres');
    assert.deepEqual([tigres.pj, tigres.gf, tigres.gc, tigres.dg], [2, 3, 5, -2]);
  });

  it('ordena por puntos, luego diferencia de gol, luego goles a favor, luego nombre', () => {
    const lista = [equipo(1, 'Zorros'), equipo(2, 'Alces'), equipo(3, 'Bravos'), equipo(4, 'Cobras')];
    const tabla = calcularTabla(lista, [
      partido(1, 2, 1, 1),
      partido(3, 4, 2, 2),
    ]);
    assert.deepEqual(tabla.map((f) => f.nombre), ['Bravos', 'Cobras', 'Alces', 'Zorros']);

    const porGoles = calcularTabla(lista, [partido(1, 2, 3, 3), partido(3, 4, 1, 1)]);
    assert.deepEqual(porGoles.map((f) => f.nombre), ['Alces', 'Zorros', 'Bravos', 'Cobras']);

    const porDiferencia = calcularTabla(lista, [partido(1, 2, 1, 0), partido(3, 4, 5, 0)]);
    assert.deepEqual(porDiferencia.map((f) => f.nombre), ['Bravos', 'Zorros', 'Alces', 'Cobras']);
  });

  it('ignora partidos con equipos que no estan en la lista', () => {
    const tabla = calcularTabla(equipos, [partido(1, 99, 4, 0), partido(98, 99, 1, 1)]);
    assert.ok(tabla.every((f) => f.pj === 0));
  });

  it('no modifica los datos de entrada', () => {
    const partidos = [partido(1, 2, 1, 0)];
    const copia = structuredClone({ equipos, partidos });
    calcularTabla(equipos, partidos);
    assert.deepEqual({ equipos, partidos }, copia);
  });
});
