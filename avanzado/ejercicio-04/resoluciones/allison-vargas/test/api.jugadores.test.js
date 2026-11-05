import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';

describe('API de jugadores', () => {
  let api;
  before(async () => { api = await levantarApi(); });
  after(() => api.cerrar());

  it('la ruta base responde el tema del ejercicio', async () => {
    const { status, cuerpo } = await api.pedir('/');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'errores de dominio' });
  });

  it('lista jugadores con paginacion y total en cabecera', async () => {
    const { status, cuerpo, cabeceras } = await api.pedir('/jugadores?limite=3&pagina=2');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo.data.map((j) => j.id), [4, 5, 6]);
    assert.deepEqual(cuerpo.paginacion, { pagina: 2, limite: 3, total: 8, totalPaginas: 3 });
    assert.equal(cabeceras.get('x-total-count'), '8');
  });

  it('filtra por texto del nick sin distinguir mayusculas', async () => {
    const { cuerpo } = await api.pedir('/jugadores?buscar=SPECTRE');
    assert.deepEqual(cuerpo.data.map((j) => j.nick), ['Spectre_X']);
  });

  it('rechaza filtros invalidos con todos los errores juntos', async () => {
    const { status, cuerpo } = await api.pedir('/jugadores?pagina=0&limite=500');
    assert.equal(status, 400);
    assert.equal(cuerpo.codigo, 'VALIDACION');
    assert.deepEqual(cuerpo.errores.map((e) => e.campo), ['pagina', 'limite']);
  });

  it('obtiene un jugador por id', async () => {
    const { status, cuerpo } = await api.pedir('/jugadores/1');
    assert.equal(status, 200);
    assert.equal(cuerpo.data.nick, 'Valkyrie');
  });

  it('responde 404 con el contexto del jugador buscado', async () => {
    const { status, cuerpo, cabeceras } = await api.pedir('/jugadores/999');
    assert.equal(status, 404);
    assert.match(cabeceras.get('content-type'), /^application\/problem\+json/);
    assert.equal(cuerpo.codigo, 'JUGADOR_NO_ENCONTRADO');
    assert.deepEqual(cuerpo.contexto, { jugadorId: 999 });
    assert.equal(cuerpo.instance, '/avanzado/ejercicio-04/jugadores/999');
  });

  it('rechaza ids mal formados como validacion y no como inexistentes', async () => {
    for (const id of ['abc', '0', '-1', '1.5', '99999999999']) {
      const { status, cuerpo } = await api.pedir(`/jugadores/${id}`);
      assert.equal(status, 400, id);
      assert.equal(cuerpo.codigo, 'VALIDACION', id);
    }
  });

  it('registra un jugador nuevo', async () => {
    const { status, cuerpo, cabeceras } = await api.json('/jugadores', { nick: '  Phantom_01 ' });
    assert.equal(status, 201);
    assert.equal(cuerpo.data.nick, 'Phantom_01');
    assert.equal(cuerpo.data.suspendido, false);
    assert.equal(cabeceras.get('location'), `/avanzado/ejercicio-04/jugadores/${cuerpo.data.id}`);
  });

  it('rechaza un nick repetido sin importar mayusculas', async () => {
    const { status, cuerpo } = await api.json('/jugadores', { nick: 'VALKYRIE' });
    assert.equal(status, 409);
    assert.equal(cuerpo.codigo, 'NICK_EN_USO');
    assert.equal(cuerpo.categoria, 'conflicto');
  });

  it('valida el nick y los campos sobrantes', async () => {
    const corto = await api.json('/jugadores', { nick: 'ab' });
    assert.equal(corto.cuerpo.errores[0].campo, 'nick');
    const raro = await api.json('/jugadores', { nick: 'con espacio' });
    assert.match(raro.cuerpo.errores[0].mensaje, /letras, numeros/);
    const extra = await api.json('/jugadores', { nick: 'Valido_1', rol: 'admin' });
    assert.deepEqual(extra.cuerpo.errores, [{ campo: 'rol', mensaje: 'campo no permitido' }]);
    const tipo = await api.json('/jugadores', { nick: 123 });
    assert.equal(tipo.cuerpo.errores[0].mensaje, 'debe ser texto');
  });

  it('rechaza un body que no es un objeto', async () => {
    const { status, cuerpo } = await api.json('/jugadores', ['Valido_1']);
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores, [{ campo: 'cuerpo', mensaje: 'debe ser un objeto' }]);
  });

  it('exige Content-Type JSON', async () => {
    const { status, cuerpo } = await api.pedir('/jugadores', { method: 'POST', body: 'nick=Valido_1' });
    assert.equal(status, 415);
    assert.equal(cuerpo.codigo, 'TIPO_NO_SOPORTADO');
  });

  it('informa los metodos permitidos', async () => {
    const { status, cabeceras, cuerpo } = await api.pedir('/jugadores', { method: 'DELETE' });
    assert.equal(status, 405);
    assert.equal(cabeceras.get('allow'), 'GET, POST');
    assert.equal(cuerpo.codigo, 'METODO_NO_PERMITIDO');
    const opciones = await api.pedir('/jugadores', { method: 'OPTIONS' });
    assert.equal(opciones.status, 204);
  });
});
