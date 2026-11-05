import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarLegacy } from '../soporte/legacy.js';

describe('comportamiento de la version original (legacy)', () => {
  let cliente;

  beforeEach(async () => {
    cliente = await levantarLegacy();
  });

  afterEach(() => cliente.cerrar());

  const equipo = (nombre, modalidad = 'futbol') => cliente.json('/equipos', { nombre, modalidad });

  it('responde 200 incluso cuando hay errores y los avisa dentro del body', async () => {
    const casos = [
      cliente.json('/equipos', {}),
      cliente.json('/equipos', { nombre: 'Leones', modalidad: 'rugby' }),
      cliente.pedir('/equipos/99'),
      cliente.pedir('/tabla'),
      cliente.json('/partidos', {}),
    ];
    for (const { status, cuerpo } of await Promise.all(casos)) {
      assert.equal(status, 200);
      assert.equal(typeof cuerpo.error, 'string');
    }
  });

  it('devuelve los recursos sin sobre y sin cabecera Location', async () => {
    const { status, cabeceras, cuerpo } = await equipo('Leones');
    assert.equal(status, 200);
    assert.equal(cabeceras.get('location'), null);
    assert.deepEqual(cuerpo, { id: 1, nombre: 'Leones', modalidad: 'futbol' });
    assert.deepEqual((await cliente.pedir('/equipos')).cuerpo, [cuerpo]);
  });

  it('acepta goles como texto y la tabla queda con valores mezclados', async () => {
    await equipo('Leones');
    await equipo('Tigres');
    const creado = await cliente.json('/partidos', { localId: 1, visitanteId: 2, golesLocal: '2', golesVisitante: '1' });
    assert.equal(creado.status, 200);
    assert.equal(creado.cuerpo.error, undefined);
    const fila = (await cliente.pedir('/tabla?modalidad=futbol')).cuerpo[0];
    assert.equal(typeof fila.gf, 'string');
    assert.equal(fila.gf, '02');
  });

  it('acepta goles negativos', async () => {
    await equipo('Leones');
    await equipo('Tigres');
    const { cuerpo } = await cliente.json('/partidos', { localId: 1, visitanteId: 2, golesLocal: -3, golesVisitante: 1 });
    assert.equal(cuerpo.golesLocal, -3);
  });

  it('no desempata por goles a favor ni por nombre: respeta el orden de creacion', async () => {
    await equipo('Zorros');
    await equipo('Alces');
    await equipo('Bravos');
    await equipo('Cobras');
    await cliente.json('/partidos', { localId: 1, visitanteId: 2, golesLocal: 1, golesVisitante: 1 });
    await cliente.json('/partidos', { localId: 3, visitanteId: 4, golesLocal: 2, golesVisitante: 2 });
    const nombres = (await cliente.pedir('/tabla?modalidad=futbol')).cuerpo.map((f) => f.nombre);
    assert.deepEqual(nombres, ['Zorros', 'Alces', 'Bravos', 'Cobras']);
  });

  it('el id depende del largo de la lista y no se valida el formato del id de la ruta', async () => {
    await equipo('Leones');
    assert.equal((await cliente.pedir('/equipos/abc')).cuerpo.error, 'no existe');
    assert.equal((await cliente.pedir('/equipos/1')).cuerpo.nombre, 'Leones');
    assert.equal((await cliente.pedir('/equipos/01')).cuerpo.nombre, 'Leones');
  });

  it('no tiene paginacion, ni 404 propio, ni control de metodos', async () => {
    for (let i = 0; i < 15; i += 1) await equipo(`Equipo ${i}`);
    assert.equal((await cliente.pedir('/equipos')).cuerpo.length, 15);
    const desconocida = await cliente.pedir('/arbitros');
    assert.equal(desconocida.status, 404);
    assert.equal(typeof desconocida.cuerpo, 'string');
    assert.equal((await cliente.pedir('/equipos', { method: 'DELETE' })).status, 404);
  });
});
