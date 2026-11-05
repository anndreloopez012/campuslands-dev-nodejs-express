import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { SEG } from '../soporte/datos.js';
import { levantar } from '../soporte/cliente.js';
import { levantarApi } from '../soporte/api.js';
import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';

describe('API de administracion del cache', () => {
  let api;
  beforeEach(async () => {
    api = await levantarApi();
    await api.pedir('/autos/1');
    await api.pedir('/autos/1/cotizacion');
    await api.pedir('/autos/2');
    await api.pedir('/autos?marca=ferrari');
  });
  afterEach(() => api.cerrar());

  it('muestra estadisticas de cache, cargas y fuente', async () => {
    await api.pedir('/autos/1');
    const { cuerpo } = await api.pedir('/cache/estadisticas');
    const { cache, cargas, fuente } = cuerpo.data;
    assert.equal(cache.entradas, 4);
    assert.equal(cache.aciertos, 2);
    assert.equal(cache.fallos, 4);
    assert.equal(cache.escrituras, 4);
    assert.equal(cache.tasaDeAcierto, 0.3333);
    assert.equal(cargas.cargas, 4);
    assert.equal(cargas.enVuelo, 0);
    assert.deepEqual(fuente, { auto: 2, lista: 1, marca: 0, total: 3 });
  });

  it('lista las claves guardadas sin exponer los valores', async () => {
    const { cuerpo } = await api.pedir('/cache/claves');
    assert.equal(cuerpo.total, 4);
    assert.ok(cuerpo.data.every((c) => !('valor' in c) && c.restanteMs > 0));
    const claves = cuerpo.data.map((c) => c.clave).sort();
    assert.deepEqual(claves, [
      'auto:1',
      'auto:2',
      'autos:lista:{"marca":"ferrari","orden":"id"}',
      'cotizacion:1:USD:20:36',
    ]);
  });

  it('filtra las claves por etiqueta y por prefijo', async () => {
    const porEtiqueta = await api.pedir('/cache/claves?etiqueta=auto:1');
    assert.deepEqual(porEtiqueta.cuerpo.data.map((c) => c.clave).sort(), ['auto:1', 'cotizacion:1:USD:20:36']);
    const porPrefijo = await api.pedir('/cache/claves?prefijo=autos:lista');
    assert.equal(porPrefijo.cuerpo.total, 1);
    assert.deepEqual(porPrefijo.cuerpo.data[0].etiquetas, ['listados']);
    assert.equal((await api.pedir('/cache/claves?prefijo=')).status, 400);
  });

  it('borra una clave puntual y responde 404 si no existe', async () => {
    assert.equal((await api.pedir('/cache/claves/auto:2', { method: 'DELETE' })).status, 204);
    const otra = await api.pedir('/cache/claves/auto:2', { method: 'DELETE' });
    assert.equal(otra.status, 404);
    assert.equal(otra.cuerpo.codigo, 'CLAVE_NO_ENCONTRADA');
    assert.equal((await api.pedir('/autos/2')).cabeceras.get('x-cache'), 'MISS');
  });

  it('invalida por etiqueta', async () => {
    const { cuerpo } = await api.pedir('/cache/etiquetas/auto:1', { method: 'DELETE' });
    assert.deepEqual(cuerpo.data, { invalidadas: 2 });
    const nada = await api.pedir('/cache/etiquetas/inexistente', { method: 'DELETE' });
    assert.deepEqual(nada.cuerpo.data, { invalidadas: 0 });
    assert.equal((await api.pedir('/cache/claves')).cuerpo.total, 2);
  });

  it('vacia todo el cache', async () => {
    const { cuerpo } = await api.pedir('/cache', { method: 'DELETE' });
    assert.deepEqual(cuerpo.data, { eliminadas: 4 });
    assert.equal((await api.pedir('/cache/claves')).cuerpo.total, 0);
  });

  it('purga solo lo que ya caduco', async () => {
    api.avanzar(95 * SEG);
    const { cuerpo } = await api.json('/cache/purgar', undefined);
    assert.deepEqual(cuerpo.data, { purgadas: 3 });
    const quedan = await api.pedir('/cache/claves');
    assert.deepEqual(quedan.cuerpo.data.map((c) => c.clave), ['cotizacion:1:USD:20:36']);
  });

  it('un cache pequeno desaloja lo menos usado', async () => {
    const chico = await levantarApi({ capacidad: 2 });
    try {
      await chico.pedir('/autos/1');
      await chico.pedir('/autos/2');
      await chico.pedir('/autos/1');
      await chico.pedir('/autos/3');
      const claves = (await chico.pedir('/cache/claves')).cuerpo.data.map((c) => c.clave);
      assert.deepEqual(claves, ['auto:1', 'auto:3']);
      assert.equal((await chico.pedir('/cache/estadisticas')).cuerpo.data.cache.desalojadas, 1);
    } finally {
      await chico.cerrar();
    }
  });
});

describe('API del reloj', () => {
  it('con reloj virtual se puede avanzar el tiempo', async () => {
    const api = await levantar(crearApp({ servicios: crearServicios({ relojVirtual: true }) }));
    try {
      const antes = (await api.pedir('/reloj')).cuerpo.data;
      assert.equal(antes.virtual, true);
      const despues = await api.json('/reloj/avanzar', { ms: 60000 });
      assert.equal(Date.parse(despues.cuerpo.data.ahora) - Date.parse(antes.ahora), 60000);
      assert.equal((await api.json('/reloj/avanzar', { ms: 0 })).status, 400);
      assert.equal((await api.json('/reloj/avanzar', { ms: 1, extra: 1 })).status, 400);
    } finally {
      await api.cerrar();
    }
  });

  it('con reloj real no se puede avanzar', async () => {
    const api = await levantar(crearApp({ servicios: crearServicios() }));
    try {
      const reloj = await api.pedir('/reloj');
      assert.equal(reloj.cuerpo.data.virtual, false);
      const { status, cuerpo } = await api.json('/reloj/avanzar', { ms: 1000 });
      assert.equal(status, 409);
      assert.equal(cuerpo.codigo, 'RELOJ_REAL');
    } finally {
      await api.cerrar();
    }
  });
});

describe('API: protocolo', () => {
  let api;
  const internos = [];
  beforeEach(async () => {
    internos.length = 0;
    api = await levantarApi({ registro: (e) => internos.push(e) });
  });
  afterEach(() => api.cerrar());

  it('405 con Allow, OPTIONS 204 y 404 para rutas desconocidas', async () => {
    const metodo = await api.pedir('/autos', { method: 'PUT' });
    assert.equal(metodo.status, 405);
    assert.equal(metodo.cabeceras.get('allow'), 'GET, POST');
    assert.equal((await api.pedir('/autos/1', { method: 'OPTIONS' })).status, 204);
    assert.equal((await api.pedir('/cache/estadisticas', { method: 'POST' })).status, 405);
    const nada = await api.pedir('/nada');
    assert.equal(nada.status, 404);
    assert.equal(nada.cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
  });

  it('415 si no es JSON, 400 si esta roto y 413 si es enorme', async () => {
    const texto = await api.pedir('/autos', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
    assert.equal(texto.status, 415);
    const roto = await api.pedir('/autos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"a":' });
    assert.equal(roto.cuerpo.codigo, 'JSON_INVALIDO');
    const grande = await api.json('/autos', { relleno: 'x'.repeat(11000) });
    assert.equal(grande.status, 413);
  });

  it('un fallo inesperado responde 500 generico y se registra aparte', async () => {
    api.servicios.autos.obtener = async () => { throw new Error('se cayo la fuente'); };
    const { status, cuerpo } = await api.pedir('/autos/1');
    assert.equal(status, 500);
    assert.deepEqual(cuerpo, { ok: false, message: 'Error interno del servidor', codigo: 'ERROR_INTERNO' });
    assert.equal(internos.length, 1);
    assert.equal(internos[0].mensaje, 'se cayo la fuente');
  });

  it('un error de la fuente no queda guardado y se reintenta en la siguiente lectura', async () => {
    api.compuerta.llamadas.length = 0;
    const original = api.servicios.autos.obtener;
    let falla = true;
    api.servicios.autos.obtener = (...args) => {
      if (falla) {
        falla = false;
        return Promise.reject(new Error('timeout'));
      }
      return original(...args);
    };
    assert.equal((await api.pedir('/autos/1')).status, 500);
    assert.equal((await api.pedir('/autos/1')).status, 200);
  });

  it('no expone la cabecera x-powered-by', async () => {
    assert.equal((await api.pedir('/')).cabeceras.get('x-powered-by'), null);
  });
});
