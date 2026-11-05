import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi, AHORA } from '../soporte/api.js';

describe('API de jugadores', () => {
  let api;

  beforeEach(async () => {
    api = await levantarApi();
  });

  afterEach(() => api.cerrar());

  it('lista los jugadores con paginacion y total', async () => {
    const { status, cabeceras, cuerpo } = await api.pedir('/jugadores');
    assert.equal(status, 200);
    assert.equal(cabeceras.get('x-total-count'), '8');
    assert.equal(cuerpo.ok, true);
    assert.equal(cuerpo.data.length, 8);
    assert.deepEqual(cuerpo.paginacion, { pagina: 1, limite: 10, total: 8, totalPaginas: 1 });
    assert.deepEqual(cuerpo.data[0], {
      id: 1,
      alias: 'Viper_X',
      region: 'NA',
      creadoEn: '2026-09-01T10:00:00.000Z',
    });
  });

  it('filtra por region y por texto', async () => {
    assert.deepEqual((await api.pedir('/jugadores?region=LATAM')).cuerpo.data.map((j) => j.id), [3, 5]);
    assert.deepEqual((await api.pedir('/jugadores?buscar=O')).cuerpo.data.map((j) => j.id), [2, 5, 6, 7]);
    assert.deepEqual((await api.pedir('/jugadores?region=EU&buscar=no')).cuerpo.data.map((j) => j.alias), ['Nova']);
  });

  it('ordena y pagina', async () => {
    const orden = await api.pedir('/jugadores?orden=alias&limite=3');
    assert.deepEqual(orden.cuerpo.data.map((j) => j.alias), ['Drift', 'Frost', 'Halcon']);
    const segunda = await api.pedir('/jugadores?orden=alias&limite=3&pagina=3');
    assert.deepEqual(segunda.cuerpo.data.map((j) => j.alias), ['Viper_X', 'Zenith']);
    assert.equal(segunda.cuerpo.paginacion.totalPaginas, 3);
  });

  it('rechaza consultas invalidas', async () => {
    for (const consulta of ['region=MARTE', 'orden=nivel', 'limite=0', 'limite=51', 'pagina=x', 'buscar=', 'extra=1', 'region=NA&region=EU']) {
      const { status, cuerpo } = await api.pedir(`/jugadores?${consulta}`);
      assert.equal(status, 400, consulta);
      assert.equal(cuerpo.codigo, 'CONSULTA_INVALIDA');
    }
  });

  it('devuelve un jugador por id y 404 si no existe', async () => {
    const encontrado = await api.pedir('/jugadores/4');
    assert.equal(encontrado.cuerpo.data.alias, 'Drift');
    const faltante = await api.pedir('/jugadores/99');
    assert.equal(faltante.status, 404);
    assert.equal(faltante.cuerpo.codigo, 'JUGADOR_NO_ENCONTRADO');
    for (const id of ['abc', '0', '-1', '1.5']) {
      const invalido = await api.pedir(`/jugadores/${id}`);
      assert.equal(invalido.status, 400, id);
      assert.equal(invalido.cuerpo.codigo, 'ID_INVALIDO');
    }
  });

  it('crea un jugador con Location y fecha del reloj', async () => {
    const { status, cabeceras, cuerpo } = await api.json('/jugadores', { alias: ' Ghost_7 ', region: 'EU' });
    assert.equal(status, 201);
    assert.equal(cabeceras.get('location'), '/avanzado/ejercicio-02/jugadores/9');
    assert.deepEqual(cuerpo.data, { id: 9, alias: 'Ghost_7', region: 'EU', creadoEn: AHORA.toISOString() });
    assert.equal((await api.pedir('/jugadores/9')).status, 200);
  });

  it('valida el cuerpo', async () => {
    const casos = [
      {},
      { alias: 'ab', region: 'EU' },
      { alias: 'a'.repeat(17), region: 'EU' },
      { alias: 'con espacio', region: 'EU' },
      { alias: 'Valido', region: 'MARTE' },
      { alias: 'Valido', region: 'EU', rating: 2000 },
      { alias: 123, region: 'EU' },
    ];
    for (const cuerpo of casos) {
      const { status, cuerpo: respuesta } = await api.json('/jugadores', cuerpo);
      assert.equal(status, 400, JSON.stringify(cuerpo));
      assert.equal(respuesta.codigo, 'VALIDACION');
      assert.ok(respuesta.errores.length >= 1);
    }
  });

  it('no repite alias sin importar mayusculas', async () => {
    const { status, cuerpo } = await api.json('/jugadores', { alias: 'viper_x', region: 'EU' });
    assert.equal(status, 409);
    assert.equal(cuerpo.codigo, 'ALIAS_DUPLICADO');
  });

  it('exige JSON, tolera JSON roto y limita el tamano', async () => {
    const tipo = await api.pedir('/jugadores', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
    assert.deepEqual([tipo.status, tipo.cuerpo.codigo], [415, 'TIPO_NO_SOPORTADO']);
    const roto = await api.pedir('/jugadores', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"alias":' });
    assert.deepEqual([roto.status, roto.cuerpo.codigo], [400, 'JSON_INVALIDO']);
    const grande = await api.json('/jugadores', { alias: 'x'.repeat(20000) });
    assert.equal(grande.status, 413);
  });

  it('responde 405 con Allow', async () => {
    const lista = await api.pedir('/jugadores', { method: 'DELETE' });
    assert.deepEqual([lista.status, lista.cabeceras.get('allow')], [405, 'GET, POST']);
    const uno = await api.pedir('/jugadores/1', { method: 'PUT' });
    assert.deepEqual([uno.status, uno.cabeceras.get('allow')], [405, 'GET']);
  });
});
