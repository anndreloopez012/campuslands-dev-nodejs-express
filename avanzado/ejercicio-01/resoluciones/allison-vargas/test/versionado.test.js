import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi, AHORA } from '../soporte/versiones.js';

const antes = () => new Date('2026-05-01T00:00:00.000Z');
const deprecada = () => AHORA;
const ultimoSegundo = () => new Date('2027-03-31T23:59:59.000Z');
const retirada = () => new Date('2027-04-01T00:00:00.000Z');

describe('ciclo de vida de las versiones', () => {
  let api;

  afterEach(() => api.cerrar());

  it('toda respuesta lleva la cabecera API-Version', async () => {
    api = await levantarApi({ reloj: deprecada });
    assert.equal((await api.pedir('/v1/personajes')).cabeceras.get('api-version'), '1');
    assert.equal((await api.pedir('/v2/personajes')).cabeceras.get('api-version'), '2');
    assert.equal((await api.pedir('/v2/personajes/99')).cabeceras.get('api-version'), '2');
    assert.equal((await api.pedir('/v1/personajes/99')).cabeceras.get('api-version'), '1');
  });

  it('v1 deprecada anuncia Deprecation, Sunset y la version sucesora', async () => {
    api = await levantarApi({ reloj: deprecada });
    const { cabeceras } = await api.pedir('/v1/personajes');
    assert.equal(cabeceras.get('deprecation'), `@${Math.floor(Date.parse('2026-07-01T00:00:00.000Z') / 1000)}`);
    assert.equal(cabeceras.get('sunset'), 'Wed, 31 Mar 2027 23:59:59 GMT');
    assert.equal(cabeceras.get('link'), '</avanzado/ejercicio-01/v2>; rel="successor-version"');
  });

  it('los errores de v1 tambien avisan de la deprecacion', async () => {
    api = await levantarApi({ reloj: deprecada });
    const { status, cabeceras } = await api.pedir('/v1/personajes/99');
    assert.equal(status, 404);
    assert.ok(cabeceras.get('deprecation'));
    assert.ok(cabeceras.get('sunset'));
  });

  it('v2 no lleva cabeceras de deprecacion', async () => {
    api = await levantarApi({ reloj: deprecada });
    const { cabeceras } = await api.pedir('/v2/personajes');
    for (const nombre of ['deprecation', 'sunset', 'link']) {
      assert.equal(cabeceras.get(nombre), null, nombre);
    }
  });

  it('antes de la fecha de deprecacion v1 es estable y no avisa nada', async () => {
    api = await levantarApi({ reloj: antes });
    const { status, cabeceras } = await api.pedir('/v1/personajes');
    assert.equal(status, 200);
    assert.equal(cabeceras.get('api-version'), '1');
    assert.equal(cabeceras.get('deprecation'), null);
    assert.equal(cabeceras.get('sunset'), null);
  });

  it('en el ultimo segundo antes del retiro v1 todavia responde', async () => {
    api = await levantarApi({ reloj: ultimoSegundo });
    assert.equal((await api.pedir('/v1/personajes')).status, 200);
  });

  it('despues del retiro v1 responde 410 con el formato clasico y el enlace a v2', async () => {
    api = await levantarApi({ reloj: retirada });
    for (const ruta of ['/v1', '/v1/personajes', '/v1/personajes/1', '/v1/loquesea']) {
      const { status, cabeceras, cuerpo } = await api.pedir(ruta);
      assert.equal(status, 410, ruta);
      assert.equal(cuerpo.codigo, 'VERSION_RETIRADA');
      assert.equal(cuerpo.ok, false);
      assert.equal(cabeceras.get('link'), '</avanzado/ejercicio-01/v2>; rel="successor-version"');
    }
    const escritura = await api.json('/v1/personajes', { nombre: 'Tarde', clase: 'mago' });
    assert.equal(escritura.status, 410);
    assert.equal((await api.pedir('/v2/personajes')).status, 200);
  });
});

describe('descubrimiento de versiones', () => {
  let api;

  afterEach(() => api.cerrar());

  it('GET /versiones lista las versiones con su estado y los cambios rotos', async () => {
    api = await levantarApi({ reloj: deprecada });
    const { status, cuerpo } = await api.pedir('/versiones');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo.data.map((v) => [v.version, v.estado]), [['v1', 'deprecada'], ['v2', 'estable']]);
    const [v1, v2] = cuerpo.data;
    assert.equal(v1.deprecadaDesde, '2026-07-01T00:00:00.000Z');
    assert.equal(v1.retiroPrevisto, '2027-03-31T23:59:59.000Z');
    assert.equal(v1.sucesora, 'v2');
    assert.equal(v1.ruta, '/avanzado/ejercicio-01/v1');
    assert.deepEqual(v1.cambiosRotos, []);
    assert.equal(v2.retiroPrevisto, null);
    assert.ok(v2.cambiosRotos.length >= 3);
  });

  it('el estado de /versiones sigue al reloj, incluida la version retirada', async () => {
    api = await levantarApi({ reloj: retirada });
    const { cuerpo } = await api.pedir('/versiones');
    assert.equal(cuerpo.data[0].estado, 'retirada');
    assert.equal(cuerpo.data[0].version, 'v1');
  });

  it('la raiz describe el ejercicio y /versiones no admite escrituras', async () => {
    api = await levantarApi();
    const raiz = await api.pedir('/');
    assert.deepEqual(raiz.cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'diseno API versionada' });
    const metodo = await api.pedir('/versiones', { method: 'POST' });
    assert.equal(metodo.status, 405);
    assert.equal(metodo.cabeceras.get('allow'), 'GET');
  });

  it('una version que no existe responde 404 VERSION_NO_SOPORTADA', async () => {
    api = await levantarApi();
    for (const ruta of ['/v9/personajes', '/v3', '/v0/personajes', '/v10']) {
      const { status, cuerpo } = await api.pedir(ruta);
      assert.equal(status, 404, ruta);
      assert.equal(cuerpo.codigo, 'VERSION_NO_SOPORTADA');
    }
    const comun = await api.pedir('/vacio');
    assert.equal(comun.cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
    assert.equal((await api.pedir('/version')).cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
  });
});

describe('las dos versiones comparten el mismo dominio', () => {
  let api;

  afterEach(() => api.cerrar());

  it('un personaje creado en v1 se ve en v2 y los atributos coinciden', async () => {
    api = await levantarApi();
    await api.json('/v1/personajes', { nombre: 'Puente', clase: 'guerrero' });
    const enV2 = await api.pedir('/v2/personajes/9');
    assert.equal(enV2.cuerpo.data.nombre, 'Puente');
    assert.deepEqual(enV2.cuerpo.data.atributos, { vida: 120, mana: 20, fuerza: 18 });
  });

  it('hp de v1 es atributos.vida de v2 para todos los personajes', async () => {
    api = await levantarApi();
    const v1 = (await api.pedir('/v1/personajes')).cuerpo.data;
    const v2 = (await api.pedir('/v2/personajes?limite=50')).cuerpo.data;
    assert.equal(v1.length, v2.length);
    for (const viejo of v1) {
      const nuevo = v2.find((p) => p.id === viejo.id);
      assert.equal(viejo.hp, nuevo.atributos.vida, viejo.nombre);
      assert.equal(viejo.nombre, nuevo.nombre);
    }
  });

  it('un cambio hecho con PATCH en v2 se refleja en v1 y un borrado desaparece en ambas', async () => {
    api = await levantarApi();
    await api.json('/v2/personajes/5', { nivel: 10 }, 'PATCH');
    assert.equal((await api.pedir('/v1/personajes/5')).cuerpo.data.nivel, 10);
    await api.pedir('/v2/personajes/5', { method: 'DELETE' });
    assert.equal((await api.pedir('/v1/personajes/5')).status, 404);
  });

  it('el nombre no puede repetirse entre versiones', async () => {
    api = await levantarApi();
    await api.json('/v2/personajes', { nombre: 'Unico', clase: 'mago' });
    assert.equal((await api.json('/v1/personajes', { nombre: 'unico', clase: 'mago' })).status, 409);
  });
});
