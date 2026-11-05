import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { construirOpenApi } from '../src/docs/openapi.js';
import { levantar } from '../soporte/cliente.js';

const AHORA = new Date('2026-11-01T10:00:00.000Z');

describe('API de equipos y torneos', () => {
  let cliente;

  beforeEach(async () => {
    cliente = await levantar(crearApp(crearServicios({ reloj: () => AHORA })));
  });

  afterEach(() => cliente.cerrar());

  it('responde la ruta principal', async () => {
    const { status, cuerpo } = await cliente.pedir('');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'documentacion de endpoints' });
  });

  describe('documentacion', () => {
    it('GET /docs entrega HTML con politica de seguridad restrictiva', async () => {
      const { status, cabeceras, cuerpo } = await cliente.pedir('/docs');
      assert.equal(status, 200);
      assert.match(cabeceras.get('content-type'), /^text\/html/);
      assert.equal(cabeceras.get('content-security-policy'), "default-src 'none'; style-src 'unsafe-inline'");
      assert.match(cuerpo, /<title>API de MOBA esports<\/title>/);
      assert.ok(cuerpo.includes('POST'));
    });

    it('GET /docs/openapi.json entrega exactamente la especificacion', async () => {
      const { status, cabeceras, cuerpo } = await cliente.pedir('/docs/openapi.json');
      assert.equal(status, 200);
      assert.match(cabeceras.get('content-type'), /^application\/json/);
      assert.deepEqual(cuerpo, JSON.parse(JSON.stringify(construirOpenApi())));
    });
  });

  describe('equipos', () => {
    it('lista, filtra, busca y ordena', async () => {
      const todos = await cliente.pedir('/equipos');
      assert.equal(todos.cuerpo.paginacion.total, 7);
      assert.equal(todos.cabeceras.get('x-total-count'), '7');

      const europa = await cliente.pedir('/equipos?region=eu&orden=victorias');
      assert.deepEqual(europa.cuerpo.data.map((e) => e.tag), ['NBF', 'VWK']);

      const buscados = await cliente.pedir('/equipos?buscar=WOLVES');
      assert.deepEqual(buscados.cuerpo.data.map((e) => e.tag), ['CRW']);

      const pagina = await cliente.pedir('/equipos?limite=3&pagina=3');
      assert.deepEqual(pagina.cuerpo.data.map((e) => e.id), [7]);
    });

    it('crea un equipo con la fecha del reloj', async () => {
      const { status, cuerpo, cabeceras } = await cliente.json('/equipos', { nombre: ' Aurora Nine ', tag: 'AUR', region: 'latam' });
      assert.equal(status, 201);
      assert.equal(cuerpo.data.nombre, 'Aurora Nine');
      assert.equal(cuerpo.data.victorias, 0);
      assert.equal(cuerpo.data.creadoEn, AHORA.toISOString());
      assert.match(cabeceras.get('location'), /\/equipos\/8$/);
    });

    it('valida el body con mensajes por campo', async () => {
      const { status, cuerpo } = await cliente.json('/equipos', { nombre: 'ab', tag: 'abc', region: 'luna', extra: 1 });
      assert.equal(status, 400);
      assert.deepEqual(cuerpo.errores.map((e) => e.campo).sort(), ['extra', 'nombre', 'region', 'tag']);
      assert.equal(cuerpo.errores.find((e) => e.campo === 'tag').mensaje, 'solo admite mayusculas y numeros');
    });

    it('rechaza nombre o tag repetidos', async () => {
      const nombre = await cliente.json('/equipos', { nombre: 'JADE DRAGONS', tag: 'ZZZ', region: 'asia' });
      assert.equal(nombre.cuerpo.codigo, 'NOMBRE_DUPLICADO');
      const tag = await cliente.json('/equipos', { nombre: 'Otro Equipo', tag: 'JDR', region: 'asia' });
      assert.equal(tag.cuerpo.codigo, 'TAG_DUPLICADO');
    });

    it('actualiza nombre y region, no el tag', async () => {
      const { status, cuerpo } = await cliente.json('/equipos/2', { nombre: 'Crimson Prime', region: 'eu' }, 'PATCH');
      assert.equal(status, 200);
      assert.equal(cuerpo.data.nombre, 'Crimson Prime');
      assert.equal(cuerpo.data.tag, 'CRW');
      assert.equal((await cliente.json('/equipos/2', { tag: 'XXX' }, 'PATCH')).status, 400);
      assert.equal((await cliente.json('/equipos/2', {}, 'PATCH')).status, 400);
    });

    it('elimina solo equipos sin inscripciones', async () => {
      assert.equal((await cliente.pedir('/equipos/1', { method: 'DELETE' })).status, 409);
      assert.equal((await cliente.pedir('/equipos/7', { method: 'DELETE' })).status, 200);
      assert.equal((await cliente.pedir('/equipos/7')).status, 404);
    });
  });

  describe('torneos e inscripciones', () => {
    it('lista torneos con inscritos, filtros y orden', async () => {
      const { cuerpo } = await cliente.pedir('/torneos');
      assert.deepEqual(cuerpo.data.map((t) => t.inscritos), [2, 4, 2, 2]);

      const abiertos = await cliente.pedir('/torneos?estado=inscripcion&orden=premio');
      assert.deepEqual(abiertos.cuerpo.data.map((t) => t.id), [1, 3]);

      const eliminacion = await cliente.pedir('/torneos?formato=eliminacion&orden=inicio');
      assert.deepEqual(eliminacion.cuerpo.data.map((t) => t.id), [4, 2]);
    });

    it('lista las inscripciones con el resumen del equipo', async () => {
      const { cuerpo } = await cliente.pedir('/torneos/1/inscripciones');
      assert.deepEqual(cuerpo.data.map((i) => i.equipo.tag), ['NBF', 'CRW']);
    });

    it('inscribe un equipo y actualiza el contador', async () => {
      const { status, cuerpo, cabeceras } = await cliente.json('/torneos/1/inscripciones', { equipoId: 3 });
      assert.equal(status, 201);
      assert.equal(cuerpo.data.equipo.tag, 'JDR');
      assert.equal(cuerpo.data.inscritoEn, AHORA.toISOString());
      assert.match(cabeceras.get('location'), /\/torneos\/1\/inscripciones$/);
      assert.equal((await cliente.pedir('/torneos/1')).cuerpo.data.inscritos, 3);
    });

    it('aplica las reglas de inscripcion', async () => {
      const llena = await cliente.json('/torneos/3/inscripciones', { equipoId: 7 });
      assert.equal(llena.cuerpo.codigo, 'TORNEO_LLENO');
      const cerrada = await cliente.json('/torneos/2/inscripciones', { equipoId: 7 });
      assert.equal(cerrada.cuerpo.codigo, 'INSCRIPCION_CERRADA');
      const repetida = await cliente.json('/torneos/1/inscripciones', { equipoId: 1 });
      assert.equal(repetida.cuerpo.codigo, 'EQUIPO_YA_INSCRITO');
      const inexistente = await cliente.json('/torneos/1/inscripciones', { equipoId: 99 });
      assert.equal(inexistente.status, 422);
    });

    it('retira un equipo y libera el cupo', async () => {
      const retirado = await cliente.pedir('/torneos/3/inscripciones/5', { method: 'DELETE' });
      assert.equal(retirado.status, 200);
      assert.equal(retirado.cuerpo.data.equipo.tag, 'IRT');

      const inscrito = await cliente.json('/torneos/3/inscripciones', { equipoId: 7 });
      assert.equal(inscrito.status, 201);
      assert.equal((await cliente.pedir('/torneos/3/inscripciones/5', { method: 'DELETE' })).status, 404);
    });

    it('un equipo retirado puede eliminarse si no tiene mas torneos', async () => {
      await cliente.json('/torneos/1/inscripciones', { equipoId: 7 });
      assert.equal((await cliente.pedir('/equipos/7', { method: 'DELETE' })).status, 409);
      await cliente.pedir('/torneos/1/inscripciones/7', { method: 'DELETE' });
      assert.equal((await cliente.pedir('/equipos/7', { method: 'DELETE' })).status, 200);
    });
  });
});
