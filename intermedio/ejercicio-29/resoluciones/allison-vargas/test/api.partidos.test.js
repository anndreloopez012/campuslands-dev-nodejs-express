import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { levantar } from '../soporte/cliente.js';

describe('API de partidos', () => {
  let cliente;

  beforeEach(async () => {
    cliente = await levantar(crearApp());
  });

  afterEach(() => cliente.cerrar());

  it('lista los partidos en orden de id y permite invertirlo', async () => {
    const normal = await cliente.pedir('/partidos');
    assert.deepEqual(normal.cuerpo.data.map((p) => p.id), [1, 2, 3, 4, 5, 6]);
    assert.equal(normal.cabeceras.get('x-total-count'), '6');
    const reciente = await cliente.pedir('/partidos?orden=reciente&limite=2');
    assert.deepEqual(reciente.cuerpo.data.map((p) => p.id), [6, 5]);
  });

  it('filtra por equipo y por modalidad', async () => {
    const equipo = await cliente.pedir('/partidos?equipoId=1');
    assert.deepEqual(equipo.cuerpo.data.map((p) => p.id), [1, 3]);
    const sala = await cliente.pedir('/partidos?modalidad=futbol_sala');
    assert.deepEqual(sala.cuerpo.data.map((p) => p.id), [4, 5]);
    const ambos = await cliente.pedir('/partidos?modalidad=futbol&equipoId=4');
    assert.deepEqual(ambos.cuerpo.data.map((p) => p.id), [2, 6]);
  });

  it('rechaza filtros invalidos', async () => {
    for (const consulta of ['equipoId=0', 'equipoId=x', 'modalidad=rugby', 'orden=goles']) {
      assert.equal((await cliente.pedir(`/partidos?${consulta}`)).status, 400, consulta);
    }
  });

  it('obtiene un partido o responde 404 y 400', async () => {
    const ok = await cliente.pedir('/partidos/1');
    assert.deepEqual(ok.cuerpo.data, { id: 1, localId: 1, visitanteId: 2, golesLocal: 2, golesVisitante: 1 });
    assert.equal((await cliente.pedir('/partidos/99')).cuerpo.codigo, 'PARTIDO_NO_ENCONTRADO');
    assert.equal((await cliente.pedir('/partidos/x')).status, 400);
  });

  it('registra un partido con 201 y lo refleja en la tabla', async () => {
    const { status, cabeceras, cuerpo } = await cliente.json('/partidos', { localId: 4, visitanteId: 3, golesLocal: 5, golesVisitante: 0 });
    assert.equal(status, 201);
    assert.equal(cabeceras.get('location'), '/intermedio/ejercicio-29/partidos/7');
    assert.equal(cuerpo.data.id, 7);
    const tabla = await cliente.pedir('/tabla?modalidad=futbol');
    assert.equal(tabla.cuerpo.data.find((f) => f.nombre === 'Halcones').pts, 4);
  });

  it('valida el cuerpo', async () => {
    const base = { localId: 1, visitanteId: 2, golesLocal: 1, golesVisitante: 0 };
    const casos = [{}, { ...base, golesLocal: -1 }, { ...base, golesLocal: 31 }, { ...base, golesLocal: '2' }, { ...base, golesVisitante: 1.5 }, { ...base, localId: 0 }, { ...base, extra: true }];
    for (const cuerpo of casos) {
      assert.equal((await cliente.json('/partidos', cuerpo)).status, 400, JSON.stringify(cuerpo));
    }
  });

  it('aplica las reglas de negocio con 422', async () => {
    const base = { golesLocal: 1, golesVisitante: 0 };
    const inexistente = await cliente.json('/partidos', { ...base, localId: 1, visitanteId: 99 });
    assert.equal(inexistente.status, 422);
    assert.equal(inexistente.cuerpo.codigo, 'REFERENCIA_INVALIDA');
    const mismo = await cliente.json('/partidos', { ...base, localId: 1, visitanteId: 1 });
    assert.equal(mismo.cuerpo.codigo, 'MISMO_EQUIPO');
    const mezcla = await cliente.json('/partidos', { ...base, localId: 1, visitanteId: 5 });
    assert.equal(mezcla.cuerpo.codigo, 'MODALIDAD_DISTINTA');
    assert.equal((await cliente.pedir('/partidos')).cabeceras.get('x-total-count'), '6');
  });

  it('exige JSON y responde 405 con Allow', async () => {
    assert.equal((await cliente.pedir('/partidos', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' })).status, 415);
    const metodo = await cliente.pedir('/partidos/1', { method: 'DELETE' });
    assert.equal(metodo.status, 405);
    assert.equal(metodo.cabeceras.get('allow'), 'GET');
  });
});
