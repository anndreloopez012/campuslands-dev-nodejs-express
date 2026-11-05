import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi, AHORA } from '../soporte/versiones.js';

describe('v2: contrato', () => {
  let api;

  beforeEach(async () => {
    api = await levantarApi();
  });

  afterEach(() => api.cerrar());

  it('un personaje trae atributos anidados y fecha de creacion, sin campo ok', async () => {
    const { status, cuerpo } = await api.pedir('/v2/personajes/1');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, {
      data: {
        id: 1,
        nombre: 'Aldric',
        clase: 'guerrero',
        nivel: 12,
        atributos: { vida: 252, mana: 42, fuerza: 38 },
        creadoEn: '2026-09-01T10:00:00.000Z',
      },
    });
  });

  it('el listado viene paginado con meta y links', async () => {
    const { status, cabeceras, cuerpo } = await api.pedir('/v2/personajes?limite=3&pagina=2&orden=nombre');
    assert.equal(status, 200);
    assert.equal(cabeceras.get('x-total-count'), '8');
    assert.deepEqual(cuerpo.meta, { pagina: 2, limite: 3, total: 8, totalPaginas: 3 });
    assert.deepEqual(cuerpo.data.map((p) => p.nombre), ['Garrick', 'Lysandra', 'Mirel']);
    assert.deepEqual(cuerpo.links, {
      self: '/avanzado/ejercicio-01/v2/personajes?limite=3&orden=nombre&pagina=2',
      first: '/avanzado/ejercicio-01/v2/personajes?limite=3&orden=nombre&pagina=1',
      prev: '/avanzado/ejercicio-01/v2/personajes?limite=3&orden=nombre&pagina=1',
      next: '/avanzado/ejercicio-01/v2/personajes?limite=3&orden=nombre&pagina=3',
      last: '/avanzado/ejercicio-01/v2/personajes?limite=3&orden=nombre&pagina=3',
    });
  });

  it('en la primera y la ultima pagina faltan prev y next', async () => {
    const primera = await api.pedir('/v2/personajes?limite=5');
    assert.equal(primera.cuerpo.links.prev, null);
    assert.ok(primera.cuerpo.links.next);
    const ultima = await api.pedir('/v2/personajes?limite=5&pagina=2');
    assert.equal(ultima.cuerpo.links.next, null);
    const vacia = await api.pedir('/v2/personajes?clase=mago&nivelMin=40');
    assert.deepEqual(vacia.cuerpo.data, []);
    assert.deepEqual(vacia.cuerpo.meta, { pagina: 1, limite: 10, total: 0, totalPaginas: 1 });
  });

  it('los errores usan application/problem+json con pointer por campo', async () => {
    const { status, cabeceras, cuerpo } = await api.json('/v2/personajes', { nombre: 'x', clase: 'bardo' });
    assert.equal(status, 400);
    assert.match(cabeceras.get('content-type'), /^application\/problem\+json/);
    assert.deepEqual(cuerpo, {
      type: '/avanzado/ejercicio-01/errores/validacion',
      title: 'Solicitud invalida',
      status: 400,
      detail: 'Datos invalidos',
      instance: '/avanzado/ejercicio-01/v2/personajes',
      code: 'VALIDACION',
      errors: [
        { pointer: '/nombre', detail: 'debe tener entre 3 y 20 caracteres' },
        { pointer: '/clase', detail: 'debe ser uno de: guerrero, mago, arquero' },
      ],
    });
  });

  it('los errores sin detalle por campo no traen errors', async () => {
    const { status, cuerpo } = await api.pedir('/v2/personajes/99');
    assert.equal(status, 404);
    assert.equal(cuerpo.title, 'No encontrado');
    assert.equal(cuerpo.code, 'PERSONAJE_NO_ENCONTRADO');
    assert.equal('errors' in cuerpo, false);
    assert.equal('ok' in cuerpo, false);
  });

  it('el catalogo de clases es nuevo en v2', async () => {
    const { cuerpo } = await api.pedir('/v2/clases');
    assert.deepEqual(cuerpo.data.map((c) => c.id), ['guerrero', 'mago', 'arquero']);
    assert.deepEqual(cuerpo.data[1].atributosBase, { vida: 70, mana: 130, fuerza: 6 });
  });
});

describe('v2: comportamiento', () => {
  let api;

  beforeEach(async () => {
    api = await levantarApi();
  });

  afterEach(() => api.cerrar());

  it('filtra por clase, rango de nivel y texto', async () => {
    assert.deepEqual((await api.pedir('/v2/personajes?clase=guerrero')).cuerpo.data.map((p) => p.id), [1, 4, 8]);
    assert.deepEqual((await api.pedir('/v2/personajes?nivelMin=10&nivelMax=25')).cuerpo.data.map((p) => p.id), [1, 2, 4]);
    assert.deepEqual((await api.pedir('/v2/personajes?buscar=EL')).cuerpo.data.map((p) => p.nombre), ['Elowen', 'Mirel']);
    assert.deepEqual((await api.pedir('/v2/personajes?orden=nivel_desc&limite=2')).cuerpo.data.map((p) => p.nivel), [31, 25]);
  });

  it('rechaza consultas invalidas', async () => {
    for (const consulta of ['clase=bardo', 'nivelMin=0', 'nivelMin=51', 'nivelMin=20&nivelMax=10', 'orden=poder', 'limite=51', 'buscar=', 'x=1']) {
      const { status, cuerpo } = await api.pedir(`/v2/personajes?${consulta}`);
      assert.equal(status, 400, consulta);
      assert.equal(cuerpo.code, 'CONSULTA_INVALIDA');
    }
  });

  it('crea con nivel inicial opcional y atributos escalados', async () => {
    const { status, cabeceras, cuerpo } = await api.json('/v2/personajes', { nombre: 'Nuevo Mago', clase: 'mago', nivel: 11 });
    assert.equal(status, 201);
    assert.equal(cabeceras.get('location'), '/avanzado/ejercicio-01/v2/personajes/9');
    assert.deepEqual(cuerpo.data.atributos, { vida: 140, mana: 260, fuerza: 12 });
    assert.equal(cuerpo.data.creadoEn, AHORA.toISOString());
    const porDefecto = await api.json('/v2/personajes', { nombre: 'Otro Mago', clase: 'mago' });
    assert.equal(porDefecto.cuerpo.data.nivel, 1);
  });

  it('valida el cuerpo y no repite nombres', async () => {
    for (const cuerpo of [{}, { nombre: 'Valido', clase: 'mago', nivel: 0 }, { nombre: 'Valido', clase: 'mago', nivel: 51 }, { nombre: 'Valido', clase: 'mago', nivel: 2.5 }, { nombre: 'Valido', clase: 'mago', hp: 5 }]) {
      assert.equal((await api.json('/v2/personajes', cuerpo)).status, 400, JSON.stringify(cuerpo));
    }
    const repetido = await api.json('/v2/personajes', { nombre: 'ALDRIC', clase: 'mago' });
    assert.equal(repetido.status, 409);
    assert.equal(repetido.cuerpo.code, 'NOMBRE_DUPLICADO');
  });

  it('actualiza parcialmente con PATCH', async () => {
    const subida = await api.json('/v2/personajes/3', { nivel: 20 }, 'PATCH');
    assert.equal(subida.status, 200);
    assert.deepEqual([subida.cuerpo.data.nivel, subida.cuerpo.data.atributos.vida], [20, 261]);
    assert.equal(subida.cuerpo.data.nombre, 'Rowan');
    assert.equal((await api.json('/v2/personajes/3', { nombre: 'Rowan Nuevo' }, 'PATCH')).cuerpo.data.nombre, 'Rowan Nuevo');
    assert.equal((await api.json('/v2/personajes/3', { nombre: 'Aldric' }, 'PATCH')).status, 409);
    assert.equal((await api.json('/v2/personajes/3', { nombre: 'Rowan Nuevo' }, 'PATCH')).status, 200);
    assert.equal((await api.json('/v2/personajes/3', {}, 'PATCH')).status, 400);
    assert.equal((await api.json('/v2/personajes/3', { clase: 'mago' }, 'PATCH')).status, 400);
    assert.equal((await api.json('/v2/personajes/99', { nivel: 2 }, 'PATCH')).status, 404);
  });

  it('elimina con 204 y luego responde 404', async () => {
    const borrado = await api.pedir('/v2/personajes/2', { method: 'DELETE' });
    assert.equal(borrado.status, 204);
    assert.equal(borrado.cuerpo, null);
    assert.equal((await api.pedir('/v2/personajes/2')).status, 404);
    assert.equal((await api.pedir('/v2/personajes/2', { method: 'DELETE' })).status, 404);
    assert.equal((await api.pedir('/v2/personajes')).cabeceras.get('x-total-count'), '7');
  });

  it('responde 405 con Allow y errores con formato problem+json en toda la v2', async () => {
    const casos = [
      ['/v2/personajes', 'DELETE', 'GET, POST'],
      ['/v2/personajes/1', 'PUT', 'GET, PATCH, DELETE'],
      ['/v2/clases', 'POST', 'GET'],
      ['/v2', 'POST', 'GET'],
    ];
    for (const [ruta, metodo, permitidos] of casos) {
      const { status, cabeceras, cuerpo } = await api.pedir(ruta, { method: metodo });
      assert.equal(status, 405, `${metodo} ${ruta}`);
      assert.equal(cabeceras.get('allow'), permitidos);
      assert.equal(cuerpo.status, 405);
    }
    const tipo = await api.pedir('/v2/personajes', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
    assert.deepEqual([tipo.status, tipo.cuerpo.code], [415, 'TIPO_NO_SOPORTADO']);
    const roto = await api.pedir('/v2/personajes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"nombre":' });
    assert.deepEqual([roto.status, roto.cuerpo.code], [400, 'JSON_INVALIDO']);
    assert.equal((await api.json('/v2/personajes', { nombre: 'x'.repeat(20000) })).status, 413);
    const desconocida = await api.pedir('/v2/armas');
    assert.deepEqual([desconocida.status, desconocida.cuerpo.code], [404, 'RUTA_NO_ENCONTRADA']);
    assert.equal((await api.pedir('/v2/personajes/abc')).cuerpo.code, 'ID_INVALIDO');
  });

  it('la raiz de v2 se describe a si misma', async () => {
    const { cuerpo } = await api.pedir('/v2');
    assert.deepEqual(cuerpo, { data: { version: 'v2', estado: 'estable', sucesora: null } });
  });
});
