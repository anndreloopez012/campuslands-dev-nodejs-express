import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { SEG, esperarHasta } from '../soporte/datos.js';
import { levantarApi } from '../soporte/api.js';
import { AUTO_NUEVO } from '../soporte/entorno.js';

describe('API de autos con cache', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  const stats = () => api.servicios.admin.estadisticas();
  const xcache = (r) => r.cabeceras.get('x-cache');

  it('la ruta base responde el tema del ejercicio', async () => {
    const { status, cuerpo } = await api.pedir('/');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'cache en memoria' });
  });

  it('la primera lectura va a la fuente y la segunda sale del cache', async () => {
    const primera = await api.pedir('/autos/1');
    const segunda = await api.pedir('/autos/1');
    assert.equal(primera.status, 200);
    assert.deepEqual([xcache(primera), xcache(segunda)], ['MISS', 'HIT']);
    assert.deepEqual(primera.cuerpo, segunda.cuerpo);
    assert.equal(primera.cuerpo.data.modelo, 'Roma');
    assert.equal(primera.cabeceras.get('cache-control'), 'private, max-age=60');
    assert.equal(stats().fuente.auto, 1);
  });

  it('el tiempo restante baja a medida que pasa el tiempo', async () => {
    await api.pedir('/autos/1');
    api.avanzar(25 * SEG);
    const r = await api.pedir('/autos/1');
    assert.equal(r.cabeceras.get('cache-control'), 'private, max-age=35');
  });

  it('responde 304 cuando el ETag coincide', async () => {
    const primera = await api.pedir('/autos/2');
    const etag = primera.cabeceras.get('etag');
    const condicional = (valor) => ({ headers: { 'if-none-match': valor, 'cache-control': 'max-age=0' } });
    const igual = await api.pedir('/autos/2', condicional(etag));
    assert.equal(igual.status, 304);
    assert.equal(igual.cuerpo, null);
    assert.equal(xcache(igual), 'HIT');
    const comodin = await api.pedir('/autos/2', condicional('*'));
    assert.equal(comodin.status, 304);
    const debil = await api.pedir('/autos/2', condicional(`W/${etag}, "otro"`));
    assert.equal(debil.status, 304);
    const distinto = await api.pedir('/autos/2', condicional('"distinto"'));
    assert.equal(distinto.status, 200);
  });

  it('el ETag cambia cuando cambia el contenido', async () => {
    const antes = (await api.pedir('/autos/3')).cabeceras.get('etag');
    await api.json('/autos/3', { precioUsd: 245000 }, 'PATCH');
    const despues = (await api.pedir('/autos/3')).cabeceras.get('etag');
    assert.notEqual(antes, despues);
  });

  it('Cache-Control: no-cache fuerza una lectura nueva y no-store no usa el cache', async () => {
    await api.pedir('/autos/1');
    const refresco = await api.pedir('/autos/1', { headers: { 'cache-control': 'no-cache' } });
    assert.equal(xcache(refresco), 'REFRESH');
    assert.equal(stats().fuente.auto, 2);
    const sin = await api.pedir('/autos/1', { headers: { 'cache-control': 'no-store' } });
    assert.equal(xcache(sin), 'BYPASS');
    assert.equal(sin.cabeceras.get('cache-control'), 'no-store');
    assert.equal(stats().fuente.auto, 3);
    assert.equal(xcache(await api.pedir('/autos/1')), 'HIT');
  });

  it('pasado el ttl sirve el valor viejo mientras lo renueva y luego vuelve a HIT', async () => {
    await api.pedir('/autos/1');
    api.avanzar(61 * SEG);
    const vieja = await api.pedir('/autos/1');
    assert.equal(xcache(vieja), 'STALE');
    assert.equal(vieja.cabeceras.get('cache-control'), 'private, max-age=0');
    await api.servicios.admin.esperarRefrescos();
    assert.equal(xcache(await api.pedir('/autos/1')), 'HIT');
    assert.equal(stats().fuente.auto, 2);
  });

  it('pasada la ventana de gracia carga de nuevo', async () => {
    await api.pedir('/autos/1');
    api.avanzar(91 * SEG);
    assert.equal(xcache(await api.pedir('/autos/1')), 'MISS');
  });

  it('lecturas simultaneas de un auto frio tocan la fuente una sola vez', async () => {
    api.compuerta.retener();
    const pedidos = [1, 2, 3].map(() => api.pedir('/autos/5'));
    await esperarHasta(() => stats().cache.fallos >= 3);
    api.compuerta.liberar();
    const respuestas = await Promise.all(pedidos);
    assert.deepEqual(respuestas.map(xcache).sort(), ['COALESCED', 'COALESCED', 'MISS']);
    assert.ok(respuestas.every((r) => r.cuerpo.data.id === 5));
    assert.equal(stats().fuente.auto, 1);
  });

  it('recuerda por poco tiempo que un auto no existe', async () => {
    const a = await api.pedir('/autos/99');
    const b = await api.pedir('/autos/99');
    assert.equal(a.status, 404);
    assert.deepEqual(b.cuerpo.contexto, { autoId: 99 });
    assert.equal(stats().fuente.auto, 1);
    api.avanzar(11 * SEG);
    await api.pedir('/autos/99');
    assert.equal(stats().fuente.auto, 2);
  });

  it('crear un auto borra la ausencia recordada de su id', async () => {
    assert.equal((await api.pedir('/autos/17')).status, 404);
    const creado = await api.json('/autos', AUTO_NUEVO);
    assert.equal(creado.status, 201);
    assert.equal(creado.cabeceras.get('location'), '/avanzado/ejercicio-07/autos/17');
    assert.equal(creado.cuerpo.data.id, 17);
    assert.equal((await api.pedir('/autos/17')).status, 200);
  });

  it('actualizar invalida el auto, sus cotizaciones y los listados', async () => {
    await api.pedir('/autos/1');
    await api.pedir('/autos/1/cotizacion');
    await api.pedir('/autos');
    const cambio = await api.json('/autos/1', { precioUsd: 300000, disponible: false }, 'PATCH');
    assert.equal(cambio.status, 200);
    assert.equal(cambio.cuerpo.data.precioUsd, 300000);
    assert.equal(xcache(await api.pedir('/autos/1')), 'MISS');
    const cotizacion = await api.pedir('/autos/1/cotizacion');
    assert.equal(xcache(cotizacion), 'MISS');
    assert.equal(cotizacion.cuerpo.data.precio, 300000);
    const lista = await api.pedir('/autos');
    assert.equal(xcache(lista), 'MISS');
    assert.equal(lista.cuerpo.data[0].precioUsd, 300000);
  });

  it('actualizar un auto no toca el cache de otros autos', async () => {
    await api.pedir('/autos/2');
    await api.json('/autos/1', { disponible: false }, 'PATCH');
    assert.equal(xcache(await api.pedir('/autos/2')), 'HIT');
  });

  it('cambiar la marca invalida el resumen de la marca vieja y de la nueva', async () => {
    await api.pedir('/marcas/ferrari/resumen');
    await api.pedir('/marcas/porsche/resumen');
    await api.json('/autos/1', { marca: 'Porsche' }, 'PATCH');
    const ferrari = await api.pedir('/marcas/ferrari/resumen');
    const porsche = await api.pedir('/marcas/porsche/resumen');
    assert.deepEqual([xcache(ferrari), xcache(porsche)], ['MISS', 'MISS']);
    assert.equal(ferrari.cuerpo.data.modelos, 1);
    assert.equal(porsche.cuerpo.data.modelos, 3);
  });

  it('eliminar borra del cache y responde 404 despues', async () => {
    await api.pedir('/autos/4');
    const borrado = await api.pedir('/autos/4', { method: 'DELETE' });
    assert.equal(borrado.status, 204);
    assert.equal((await api.pedir('/autos/4')).status, 404);
    assert.equal((await api.pedir('/autos/4/cotizacion')).status, 404);
    assert.equal((await api.pedir('/autos/4', { method: 'DELETE' })).status, 404);
  });

  it('un listado con otro orden de parametros o valores por defecto usa la misma entrada', async () => {
    const a = await api.pedir('/autos?marca=ferrari&orden=id');
    const b = await api.pedir('/autos?orden=id&marca=ferrari&pagina=1&limite=10');
    const c = await api.pedir('/autos?marca=FERRARI');
    assert.deepEqual([xcache(a), xcache(b), xcache(c)], ['MISS', 'HIT', 'HIT']);
    assert.equal(stats().fuente.lista, 1);
    assert.equal(api.servicios.cache.claves({ prefijo: 'autos:lista' }).length, 1);
  });

  it('filtra, ordena y pagina un listado sobre una sola lectura a la fuente', async () => {
    const p1 = await api.pedir('/autos?categoria=suv&orden=-precio&limite=2');
    assert.deepEqual(p1.cuerpo.data.map((a) => a.id), [10, 4]);
    assert.equal(p1.cabeceras.get('x-total-count'), '3');
    assert.equal(p1.cuerpo.paginacion.totalPaginas, 2);
    const p2 = await api.pedir('/autos?categoria=suv&orden=-precio&limite=2&pagina=2');
    assert.deepEqual(p2.cuerpo.data.map((a) => a.id), [8]);
    const baratos = await api.pedir('/autos?maximo=200000&disponible=true&orden=precio');
    assert.deepEqual(baratos.cuerpo.data.map((a) => a.id), [6]);
  });

  it('crear un auto invalida los listados', async () => {
    await api.pedir('/autos?marca=ferrari');
    await api.json('/autos', AUTO_NUEVO);
    const lista = await api.pedir('/autos?marca=ferrari');
    assert.equal(xcache(lista), 'MISS');
    assert.equal(lista.cuerpo.paginacion.total, 3);
  });
});

describe('API de cotizaciones y marcas', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  const xcache = (r) => r.cabeceras.get('x-cache');

  it('cotiza con valores por defecto y la repite desde el cache', async () => {
    const a = await api.pedir('/autos/1/cotizacion');
    const b = await api.pedir('/autos/1/cotizacion');
    assert.deepEqual([xcache(a), xcache(b)], ['MISS', 'HIT']);
    assert.equal(a.cuerpo.data.moneda, 'USD');
    assert.equal(a.cuerpo.data.total, 288990);
    assert.equal(a.cuerpo.data.meses, 36);
    assert.equal(a.cabeceras.get('cache-control'), 'private, max-age=120');
  });

  it('cada combinacion de parametros tiene su propia entrada', async () => {
    const eur = await api.pedir('/autos/1/cotizacion?moneda=EUR&anticipo=50&meses=24');
    const usd = await api.pedir('/autos/1/cotizacion');
    assert.equal(eur.cuerpo.data.moneda, 'EUR');
    assert.equal(eur.cuerpo.data.meses, 24);
    assert.equal(xcache(usd), 'MISS');
    assert.equal(api.servicios.cache.claves({ prefijo: 'cotizacion:1' }).length, 2);
  });

  it('la cotizacion reutiliza el auto ya guardado', async () => {
    await api.pedir('/autos/1');
    await api.pedir('/autos/1/cotizacion');
    assert.equal(api.servicios.admin.estadisticas().fuente.auto, 1);
  });

  it('valida los parametros de la cotizacion', async () => {
    const mala = await api.pedir('/autos/1/cotizacion?moneda=JPY&anticipo=95&meses=13');
    assert.equal(mala.status, 400);
    assert.deepEqual(mala.cuerpo.errores.map((e) => e.campo).sort(), ['anticipo', 'meses', 'moneda']);
    const texto = await api.pedir('/autos/1/cotizacion?meses=abc');
    assert.equal(texto.cuerpo.errores[0].campo, 'meses');
    assert.equal((await api.pedir('/autos/99/cotizacion')).cuerpo.codigo, 'AUTO_NO_ENCONTRADO');
  });

  it('resume una marca sin distinguir mayusculas y comparte la entrada', async () => {
    const a = await api.pedir('/marcas/Ferrari/resumen');
    const b = await api.pedir('/marcas/FERRARI/resumen');
    assert.deepEqual([xcache(a), xcache(b)], ['MISS', 'HIT']);
    assert.equal(a.cuerpo.data.modelos, 2);
    assert.equal(a.cuerpo.data.precioPromedioUsd, 385500);
    const guion = await api.pedir('/marcas/Rolls-Royce/resumen');
    assert.equal(guion.cuerpo.data.marca, 'Rolls-Royce');
  });

  it('una marca desconocida es 404 y se recuerda hasta que aparece', async () => {
    const a = await api.pedir('/marcas/tesla/resumen');
    assert.equal(a.status, 404);
    assert.equal(a.cuerpo.codigo, 'MARCA_NO_ENCONTRADA');
    await api.pedir('/marcas/tesla/resumen');
    assert.equal(api.servicios.admin.estadisticas().fuente.marca, 1);
    await api.json('/autos', { ...AUTO_NUEVO, marca: 'Tesla', modelo: 'Roadster', vin: '5YJRE1A31A1000001' });
    const b = await api.pedir('/marcas/tesla/resumen');
    assert.equal(b.status, 200);
    assert.equal(b.cuerpo.data.modelos, 1);
  });
});

describe('API de autos: validacion', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  it('rechaza un auto nuevo con datos incorrectos', async () => {
    const { status, cuerpo } = await api.json('/autos', {
      marca: 'F',
      anio: 1800,
      categoria: 'camion',
      precioUsd: 10,
      potenciaHp: 'mucha',
      vin: 'ABC',
      disponible: 'si',
      extra: true,
    });
    assert.equal(status, 400);
    assert.deepEqual(
      cuerpo.errores.map((e) => e.campo).sort(),
      ['anio', 'categoria', 'disponible', 'extra', 'marca', 'modelo', 'potenciaHp', 'precioUsd', 'vin'],
    );
  });

  it('rechaza VIN con letras no validas y VIN repetido', async () => {
    const malo = await api.json('/autos', { ...AUTO_NUEVO, vin: 'ZFF90SLA0R03100IO' });
    assert.equal(malo.status, 400);
    const repetido = await api.json('/autos', { ...AUTO_NUEVO, vin: 'zff95nla2p0280002' });
    assert.equal(repetido.status, 409);
    assert.equal(repetido.cuerpo.codigo, 'VIN_DUPLICADO');
  });

  it('los cambios parciales exigen al menos un campo y validan lo enviado', async () => {
    assert.equal((await api.json('/autos/1', {}, 'PATCH')).status, 400);
    const mal = await api.json('/autos/1', { precioUsd: 5, modelo: 3 }, 'PATCH');
    assert.deepEqual(mal.cuerpo.errores.map((e) => e.campo).sort(), ['modelo', 'precioUsd']);
    assert.equal((await api.json('/autos/50', { disponible: true }, 'PATCH')).status, 404);
    assert.equal((await api.json('/autos/1', [], 'PATCH')).status, 400);
  });

  it('valida filtros y paginacion del listado', async () => {
    const { status, cuerpo } = await api.pedir('/autos?categoria=tractor&minimo=9&maximo=abc&orden=azar&limite=99&disponible=quiza');
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores.map((e) => e.campo).sort(), ['categoria', 'disponible', 'limite', 'maximo', 'orden']);
    const cruzado = await api.pedir('/autos?minimo=500000&maximo=100000');
    assert.equal(cruzado.cuerpo.errores[0].campo, 'minimo');
  });

  it('ids y marcas invalidos', async () => {
    assert.equal((await api.pedir('/autos/abc')).status, 400);
    assert.equal((await api.pedir('/autos/0')).status, 400);
    assert.equal((await api.pedir(`/marcas/${'x'.repeat(31)}/resumen`)).status, 400);
  });
});
