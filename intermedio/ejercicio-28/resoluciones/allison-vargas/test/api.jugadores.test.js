import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { levantar } from '../soporte/cliente.js';

const AHORA = new Date('2026-11-01T10:00:00.000Z');

describe('API de jugadores', () => {
  let cliente;

  beforeEach(async () => {
    cliente = await levantar(crearApp(crearServicios({ reloj: () => AHORA })));
  });

  afterEach(() => cliente.cerrar());

  it('responde la ruta principal', async () => {
    const { status, cuerpo } = await cliente.pedir('');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, {
      ok: true,
      message: 'Ejercicio ejecutado correctamente',
      topic: 'coleccion de ejemplos HTTP',
    });
  });

  it('lista con paginacion y total en cabecera', async () => {
    const { status, cabeceras, cuerpo } = await cliente.pedir('/jugadores?limite=3&pagina=2');
    assert.equal(status, 200);
    assert.equal(cabeceras.get('x-total-count'), '8');
    assert.equal(cuerpo.data.length, 3);
    assert.deepEqual(cuerpo.paginacion, { pagina: 2, limite: 3, total: 8, totalPaginas: 3 });
    assert.deepEqual(cuerpo.data.map((j) => j.id), [4, 5, 6]);
  });

  it('filtra por region y ordena por kills', async () => {
    const { cuerpo } = await cliente.pedir('/jugadores?region=latam&orden=kills');
    assert.deepEqual(cuerpo.data.map((j) => j.nick), ['Rastro', 'Mara']);
  });

  it('busca por parte del nick sin distinguir mayusculas', async () => {
    const { cuerpo } = await cliente.pedir('/jugadores?buscar=GHO');
    assert.deepEqual(cuerpo.data.map((j) => j.nick), ['Ghost']);
  });

  it('rechaza filtros, ordenes y limites invalidos', async () => {
    for (const consulta of ['region=marte', 'orden=edad', 'limite=0', 'limite=51', 'pagina=x', 'zona=1', 'buscar=']) {
      const { status, cuerpo } = await cliente.pedir(`/jugadores?${consulta}`);
      assert.equal(status, 400, consulta);
      assert.equal(cuerpo.codigo, 'CONSULTA_INVALIDA');
    }
  });

  it('obtiene un jugador por id', async () => {
    const { status, cuerpo } = await cliente.pedir('/jugadores/1');
    assert.equal(status, 200);
    assert.equal(cuerpo.data.nick, 'Ghost');
  });

  it('responde 404 si el jugador no existe y 400 si el id es invalido', async () => {
    const noExiste = await cliente.pedir('/jugadores/999');
    assert.equal(noExiste.status, 404);
    assert.equal(noExiste.cuerpo.codigo, 'JUGADOR_NO_ENCONTRADO');
    for (const id of ['abc', '0', '-1', '01', '1.5']) {
      assert.equal((await cliente.pedir(`/jugadores/${id}`)).status, 400, id);
    }
  });

  it('crea un jugador con estadisticas en cero y cabecera Location', async () => {
    const { status, cabeceras, cuerpo } = await cliente.json('/jugadores', { nick: ' Nuevo_1 ', region: 'asia' });
    assert.equal(status, 201);
    assert.equal(cabeceras.get('location'), '/intermedio/ejercicio-28/jugadores/9');
    assert.deepEqual(cuerpo.data, {
      id: 9,
      nick: 'Nuevo_1',
      region: 'asia',
      partidas: 0,
      victorias: 0,
      kills: 0,
      creadoEn: AHORA.toISOString(),
    });
    assert.equal((await cliente.pedir('/jugadores/9')).status, 200);
  });

  it('valida el cuerpo al crear', async () => {
    const casos = [
      {},
      { nick: 'ab', region: 'na' },
      { nick: 'x'.repeat(17), region: 'na' },
      { nick: 'con espacio', region: 'na' },
      { nick: 'Valido', region: 'marte' },
      { nick: 'Valido', region: 'na', extra: 1 },
      { nick: 5, region: 'na' },
    ];
    for (const cuerpo of casos) {
      const respuesta = await cliente.json('/jugadores', cuerpo);
      assert.equal(respuesta.status, 400, JSON.stringify(cuerpo));
      assert.equal(respuesta.cuerpo.ok, false);
      assert.ok(respuesta.cuerpo.errores.length > 0);
    }
  });

  it('no permite repetir un nick aunque cambien las mayusculas', async () => {
    const { status, cuerpo } = await cliente.json('/jugadores', { nick: 'GHOST', region: 'na' });
    assert.equal(status, 409);
    assert.equal(cuerpo.codigo, 'NICK_DUPLICADO');
  });

  it('exige application/json al crear', async () => {
    const { status, cuerpo } = await cliente.pedir('/jugadores', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'nick=Ana',
    });
    assert.equal(status, 415);
    assert.equal(cuerpo.codigo, 'TIPO_NO_SOPORTADO');
  });

  it('responde 405 con la cabecera Allow en metodos no permitidos', async () => {
    const lista = await cliente.pedir('/jugadores', { method: 'PUT' });
    assert.equal(lista.status, 405);
    assert.equal(lista.cabeceras.get('allow'), 'GET, POST');
    const detalle = await cliente.pedir('/jugadores/1', { method: 'DELETE' });
    assert.equal(detalle.status, 405);
    assert.equal(detalle.cabeceras.get('allow'), 'GET');
  });

  it('responde 404 en rutas desconocidas', async () => {
    const { status, cuerpo } = await cliente.pedir('/armas');
    assert.equal(status, 404);
    assert.equal(cuerpo.ok, false);
  });
});
