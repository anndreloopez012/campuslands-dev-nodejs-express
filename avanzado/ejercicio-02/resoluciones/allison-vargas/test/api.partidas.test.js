import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi, AHORA } from '../soporte/api.js';

describe('API de partidas', () => {
  let api;

  beforeEach(async () => {
    api = await levantarApi();
  });

  afterEach(() => api.cerrar());

  const crear = (jugadorA = 1, jugadorB = 2, mapa = 'Puerto') => api.json('/partidas', { jugadorA, jugadorB, mapa });
  const resultado = (id, puntajeA, puntajeB) => api.json(`/partidas/${id}/resultado`, { puntajeA, puntajeB });

  it('crea una partida pendiente', async () => {
    const { status, cabeceras, cuerpo } = await crear();
    assert.equal(status, 201);
    assert.equal(cabeceras.get('location'), '/avanzado/ejercicio-02/partidas/1');
    assert.deepEqual(cuerpo.data, {
      id: 1,
      jugadorA: 1,
      jugadorB: 2,
      mapa: 'Puerto',
      estado: 'pendiente',
      puntajeA: null,
      puntajeB: null,
      ganadorId: null,
      creadaEn: AHORA.toISOString(),
      finalizadaEn: null,
    });
  });

  it('valida el cuerpo de la partida', async () => {
    const casos = [
      {},
      { jugadorA: 1, jugadorB: 2 },
      { jugadorA: 1, jugadorB: 2, mapa: 'Luna' },
      { jugadorA: '1', jugadorB: 2, mapa: 'Puerto' },
      { jugadorA: 0, jugadorB: 2, mapa: 'Puerto' },
      { jugadorA: 1, jugadorB: 2, mapa: 'Puerto', estado: 'finalizada' },
    ];
    for (const cuerpo of casos) {
      const { status, cuerpo: respuesta } = await api.json('/partidas', cuerpo);
      assert.equal(status, 400, JSON.stringify(cuerpo));
      assert.equal(respuesta.codigo, 'VALIDACION');
    }
  });

  it('un jugador no puede jugar contra si mismo', async () => {
    const { status, cuerpo } = await crear(3, 3);
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores, [{ campo: 'jugadorB', mensaje: 'debe ser distinto de jugadorA' }]);
  });

  it('rechaza jugadores que no existen con 422', async () => {
    const primero = await crear(99, 2);
    assert.equal(primero.status, 422);
    assert.equal(primero.cuerpo.codigo, 'REFERENCIA_INVALIDA');
    assert.equal(primero.cuerpo.errores[0].campo, 'jugadorA');
    const segundo = await crear(1, 99);
    assert.equal(segundo.cuerpo.errores[0].campo, 'jugadorB');
  });

  it('registra el resultado y define al ganador', async () => {
    await crear(1, 2);
    const { status, cuerpo } = await resultado(1, 9, 13);
    assert.equal(status, 200);
    assert.equal(cuerpo.data.estado, 'finalizada');
    assert.equal(cuerpo.data.ganadorId, 2);
    assert.deepEqual([cuerpo.data.puntajeA, cuerpo.data.puntajeB], [9, 13]);
    assert.equal(cuerpo.data.finalizadaEn, AHORA.toISOString());
    assert.equal((await api.pedir('/partidas/1')).cuerpo.data.estado, 'finalizada');
  });

  it('no acepta empates ni un segundo resultado', async () => {
    await crear();
    const empate = await resultado(1, 10, 10);
    assert.equal(empate.status, 422);
    assert.equal(empate.cuerpo.codigo, 'EMPATE_NO_PERMITIDO');
    assert.equal((await api.pedir('/partidas/1')).cuerpo.data.estado, 'pendiente');
    assert.equal((await resultado(1, 13, 5)).status, 200);
    const repetido = await resultado(1, 5, 13);
    assert.deepEqual([repetido.status, repetido.cuerpo.codigo], [409, 'PARTIDA_FINALIZADA']);
    assert.equal((await api.pedir('/partidas/1')).cuerpo.data.ganadorId, 1);
  });

  it('valida los puntajes y la existencia de la partida', async () => {
    await crear();
    for (const cuerpo of [{}, { puntajeA: 31, puntajeB: 2 }, { puntajeA: -1, puntajeB: 2 }, { puntajeA: 'a', puntajeB: 2 }, { puntajeA: 1.5, puntajeB: 2 }, { puntajeA: 1 }]) {
      const { status } = await api.json('/partidas/1/resultado', cuerpo);
      assert.equal(status, 400, JSON.stringify(cuerpo));
    }
    assert.equal((await resultado(99, 13, 1)).status, 404);
    assert.equal((await resultado('abc', 13, 1)).cuerpo.codigo, 'ID_INVALIDO');
  });

  it('lista y filtra partidas', async () => {
    await crear(1, 2, 'Puerto');
    await crear(3, 4, 'Azotea');
    await crear(1, 5, 'Azotea');
    await resultado(2, 13, 7);
    const ids = async (consulta) => (await api.pedir(`/partidas${consulta}`)).cuerpo.data.map((p) => p.id);
    assert.deepEqual(await ids(''), [1, 2, 3]);
    assert.deepEqual(await ids('?estado=finalizada'), [2]);
    assert.deepEqual(await ids('?estado=pendiente'), [1, 3]);
    assert.deepEqual(await ids('?jugadorId=1'), [1, 3]);
    assert.deepEqual(await ids('?mapa=Azotea'), [2, 3]);
    assert.deepEqual(await ids('?orden=id_desc'), [3, 2, 1]);
    assert.deepEqual(await ids('?mapa=Azotea&jugadorId=1&estado=pendiente'), [3]);
    assert.equal((await api.pedir('/partidas?estado=otro')).status, 400);
    assert.equal((await api.pedir('/partidas')).cabeceras.get('x-total-count'), '3');
  });

  it('responde 404 y 405 donde corresponde', async () => {
    const faltante = await api.pedir('/partidas/5');
    assert.deepEqual([faltante.status, faltante.cuerpo.codigo], [404, 'PARTIDA_NO_ENCONTRADA']);
    const resultadoGet = await api.pedir('/partidas/1/resultado');
    assert.deepEqual([resultadoGet.status, resultadoGet.cabeceras.get('allow')], [405, 'POST']);
    const borrar = await api.pedir('/partidas/1', { method: 'DELETE' });
    assert.deepEqual([borrar.status, borrar.cabeceras.get('allow')], [405, 'GET']);
  });
});
