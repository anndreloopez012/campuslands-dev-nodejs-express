import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DIA, levantarApi, linea } from '../soporte/api.js';

const BASE = '/avanzado/ejercicio-14';

async function conApi(prueba) {
  const api = await levantarApi();
  try {
    await prueba(api);
  } finally {
    await api.cerrar();
  }
}

describe('metricas http', () => {
  it('cuenta por metodo, patron de ruta y status, no por url real', () => conApi(async (api) => {
    await api.pedir('/libros/1');
    await api.pedir('/libros/2');
    await api.pedir('/libros/99');
    await api.pedir('/no-existe');
    await api.pedir('/libros', { method: 'DELETE' });
    const r = await api.pedir('/metrics');
    assert.equal(r.status, 200);
    assert.match(r.cabeceras.get('content-type'), /^text\/plain;.*version=0\.0\.4/);
    const texto = r.cuerpo;
    assert.equal(linea(texto, `http_peticiones_total{metodo="GET",ruta="${BASE}/libros/:id",status="200"}`).split(' ')[1], '2');
    assert.ok(linea(texto, `http_peticiones_total{metodo="GET",ruta="${BASE}/libros/:id",status="404"}`));
    assert.ok(linea(texto, 'http_peticiones_total{metodo="GET",ruta="sin_ruta",status="404"}'));
    assert.ok(linea(texto, `http_peticiones_total{metodo="DELETE",ruta="${BASE}/libros",status="405"}`));
    assert.equal(texto.includes('/libros/1"'), false);
  }));

  it('mide la duracion en un histograma y lleva las peticiones en curso', () => conApi(async (api) => {
    await api.pedir('/libros');
    await api.pedir('/libros');
    const texto = await api.metricas();
    const ruta = `metodo="GET",ruta="${BASE}/libros"`;
    assert.equal(linea(texto, `http_duracion_segundos_bucket{${ruta},le="0.005"}`).split(' ')[1], '0');
    assert.equal(linea(texto, `http_duracion_segundos_bucket{${ruta},le="0.01"}`).split(' ')[1], '2');
    assert.equal(linea(texto, `http_duracion_segundos_count{${ruta}}`).split(' ')[1], '2');
    assert.equal(linea(texto, `http_duracion_segundos_sum{${ruta}}`).split(' ')[1], '0.02');
    assert.equal(linea(texto, 'http_peticiones_en_curso').split(' ')[1], '1');
  }));

  it('entrega las mismas metricas en JSON y un resumen legible', () => conApi(async (api) => {
    for (let i = 0; i < 4; i += 1) await api.pedir('/libros');
    await api.pedir('/libros/abc');
    const json = await api.pedir('/metrics/json');
    assert.equal(json.cabeceras.get('cache-control'), 'no-store');
    const nombres = json.cuerpo.data.metricas.map((m) => m.nombre);
    assert.ok(nombres.includes('http_peticiones_total'));
    assert.equal(json.cuerpo.data.seriesDescartadas, 0);
    api.avanzar(65_000);
    const { data } = (await api.pedir('/metrics/resumen')).cuerpo;
    assert.equal(data.tiempoActivoS, 65);
    assert.equal(data.http.errores4xx, 1);
    assert.equal(data.http.errores5xx, 0);
    assert.equal(data.http.tasaError, 0);
    assert.equal(data.http.latenciaMs.p50, 7.5);
    assert.equal(data.http.latenciaMs.promedio, 10);
    assert.deepEqual(data.http.masUsadas[0], { ruta: `GET ${BASE}/libros`, peticiones: 4 });
    assert.equal(data.biblioteca.disponibles, 25);
  }));
});

describe('prestamos y metricas de negocio', () => {
  it('presta, devuelve a tiempo y con atraso, y lo refleja en las metricas', () => conApi(async (api) => {
    const a = await api.prestar(1, 'Ana Torres');
    assert.equal(a.status, 201);
    assert.equal(a.cabeceras.get('location'), `${BASE}/prestamos/1`);
    assert.equal(a.cuerpo.data.venceEn, '2026-11-19T12:00:00.000Z');
    const b = await api.prestar(5, 'Luis  Rojas');
    assert.equal(b.cuerpo.data.lector, 'Luis Rojas');
    assert.equal((await api.pedir('/libros/1')).cuerpo.data.disponibles, 2);

    api.avanzar(3 * DIA);
    const d1 = await api.devolver(1);
    assert.equal(d1.cuerpo.data.dias, 3);
    assert.equal(d1.cuerpo.data.multa, 0);

    api.avanzar(17 * DIA);
    const d2 = await api.devolver(2);
    assert.equal(d2.cuerpo.data.dias, 20);
    assert.equal(d2.cuerpo.data.diasAtraso, 6);
    assert.equal(d2.cuerpo.data.multa, 3000);
    const otra = await api.devolver(2);
    assert.equal(otra.cuerpo.codigo, 'PRESTAMO_YA_DEVUELTO');

    const texto = await api.metricas();
    assert.equal(linea(texto, 'biblioteca_prestamos_total{genero="novela"}').split(' ')[1], '1');
    assert.equal(linea(texto, 'biblioteca_prestamos_total{genero="poesia"}').split(' ')[1], '1');
    assert.equal(linea(texto, 'biblioteca_devoluciones_total{puntual="si"}').split(' ')[1], '1');
    assert.equal(linea(texto, 'biblioteca_devoluciones_total{puntual="no"}').split(' ')[1], '1');
    assert.equal(linea(texto, 'biblioteca_dias_prestamo_bucket{le="3"}').split(' ')[1], '1');
    assert.equal(linea(texto, 'biblioteca_dias_prestamo_bucket{le="21"}').split(' ')[1], '2');
    assert.equal(linea(texto, 'biblioteca_dias_prestamo_sum').split(' ')[1], '23');
    assert.equal(linea(texto, 'biblioteca_prestamos_activos').split(' ')[1], '0');
    assert.equal(linea(texto, 'biblioteca_ejemplares_disponibles{genero="cuento"}').split(' ')[1], '5');
  }));

  it('rechaza sin ejemplares o por limite del lector y cuenta el motivo', () => conApi(async (api) => {
    assert.equal((await api.prestar(4, 'Rosa Diaz')).status, 201);
    const sin = await api.prestar(4, 'Pedro Paz');
    assert.equal(sin.status, 409);
    assert.equal(sin.cuerpo.codigo, 'SIN_EJEMPLARES');
    await api.prestar(1, 'Rosa Diaz');
    await api.prestar(2, 'Rosa Diaz');
    const limite = await api.prestar(3, 'Rosa Diaz');
    assert.equal(limite.cuerpo.codigo, 'LIMITE_DE_PRESTAMOS');
    const texto = await api.metricas();
    assert.equal(linea(texto, 'biblioteca_prestamos_rechazados_total{motivo="sin_ejemplares"}').split(' ')[1], '1');
    assert.equal(linea(texto, 'biblioteca_prestamos_rechazados_total{motivo="limite_lector"}').split(' ')[1], '1');
    assert.equal(linea(texto, 'biblioteca_prestamos_activos').split(' ')[1], '3');
    const activos = await api.pedir('/prestamos?activos=true');
    assert.equal(activos.cuerpo.data.length, 3);
    const inactivos = await api.pedir('/prestamos?activos=false');
    assert.equal(inactivos.cuerpo.data.length, 0);
  }));

  it('valida datos de entrada y filtros', () => conApi(async (api) => {
    const v = await api.json('/prestamos', { libroId: 'uno', lector: 'X1', extra: 1 });
    assert.equal(v.status, 400);
    assert.deepEqual(v.cuerpo.errores.map((e) => e.campo).sort(), ['extra', 'lector', 'libroId']);
    assert.equal((await api.prestar(999, 'Ana Torres')).cuerpo.codigo, 'LIBRO_NO_ENCONTRADO');
    assert.equal((await api.devolver(42)).cuerpo.codigo, 'PRESTAMO_NO_ENCONTRADO');
    assert.equal((await api.pedir('/libros?genero=terror')).status, 400);
    assert.equal((await api.pedir('/libros?genero=poesia')).cuerpo.data.length, 2);
    assert.equal((await api.pedir('/prestamos?activos=talvez')).status, 400);
    assert.equal((await api.pedir('/prestamos', { method: 'POST', body: 'x' })).status, 415);
    const raiz = await api.pedir('/');
    assert.equal(raiz.cuerpo.topic, 'metricas simples');
  }));
});
