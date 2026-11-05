import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';

describe('API de consulta', () => {
  let api;
  before(async () => { api = await levantarApi(); });
  after(() => api.cerrar());

  it('la ruta base responde el tema del ejercicio', async () => {
    const { status, cuerpo } = await api.pedir('/');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'transacciones simuladas' });
  });

  it('lista clubes y filtra por modalidad', async () => {
    const todos = await api.pedir('/clubes');
    assert.equal(todos.cuerpo.paginacion.total, 6);
    const futsal = await api.pedir('/clubes?modalidad=futsal');
    assert.deepEqual(futsal.cuerpo.data.map((c) => c.id), [5, 6]);
    const mala = await api.pedir('/clubes?modalidad=rugby');
    assert.equal(mala.status, 400);
    assert.equal(mala.cuerpo.codigo, 'VALIDACION');
  });

  it('el detalle de un club trae sus jugadores', async () => {
    const { status, cuerpo } = await api.pedir('/clubes/6');
    assert.equal(status, 200);
    assert.equal(cuerpo.data.jugadores.length, cuerpo.data.plantilla);
    assert.equal(cuerpo.data.jugadores.length, 8);
  });

  it('un club inexistente responde 404 con contexto', async () => {
    const { status, cuerpo } = await api.pedir('/clubes/77');
    assert.equal(status, 404);
    assert.equal(cuerpo.codigo, 'CLUB_NO_ENCONTRADO');
    assert.deepEqual(cuerpo.contexto, { clubId: 77 });
  });

  it('lista jugadores con filtros combinados y total en cabecera', async () => {
    const { cuerpo, cabeceras } = await api.pedir('/jugadores?clubId=5&limite=4');
    assert.equal(cuerpo.data.length, 4);
    assert.equal(cuerpo.paginacion.total, 10);
    assert.equal(cabeceras.get('x-total-count'), '10');
    assert.ok(cuerpo.data.every((j) => j.clubId === 5));
    const futsal = await api.pedir('/jugadores?modalidad=futsal');
    assert.equal(futsal.cuerpo.paginacion.total, 18);
  });

  it('busca jugadores por nombre sin distinguir mayusculas', async () => {
    const { cuerpo } = await api.pedir('/jugadores?buscar=MATEO&limite=50');
    assert.ok(cuerpo.data.length > 3);
    assert.ok(cuerpo.data.every((j) => j.nombre.toLowerCase().includes('mateo')));
  });

  it('valida los filtros de consulta', async () => {
    const { status, cuerpo } = await api.pedir('/jugadores?clubId=abc&pagina=0');
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores.map((e) => e.campo), ['clubId', 'pagina']);
  });

  it('un jugador por id y su 404', async () => {
    const encontrado = await api.pedir('/jugadores/21');
    assert.equal(encontrado.cuerpo.data.clubId, 2);
    const falta = await api.pedir('/jugadores/500');
    assert.equal(falta.status, 404);
    assert.equal(falta.cuerpo.codigo, 'JUGADOR_NO_ENCONTRADO');
    const mala = await api.pedir('/jugadores/uno');
    assert.equal(mala.status, 400);
  });

  it('lista agentes y auditoria inicial', async () => {
    const agentes = await api.pedir('/agentes');
    assert.equal(agentes.cuerpo.data.length, 3);
    const auditoria = await api.pedir('/auditoria');
    assert.deepEqual(auditoria.cuerpo.data, {
      consistente: true,
      dinero: { inicial: 283000, actual: 283000 },
      violaciones: [],
    });
  });

  it('los metodos no permitidos informan Allow', async () => {
    const { status, cabeceras, cuerpo } = await api.pedir('/clubes', { method: 'POST' });
    assert.equal(status, 405);
    assert.equal(cabeceras.get('allow'), 'GET');
    assert.equal(cuerpo.codigo, 'METODO_NO_PERMITIDO');
  });
});
