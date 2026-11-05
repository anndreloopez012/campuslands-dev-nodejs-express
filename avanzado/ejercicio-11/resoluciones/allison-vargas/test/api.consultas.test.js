import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';
import { cancion, isrcDe, lista } from '../soporte/entorno.js';

describe('consultas', () => {
  let api;
  before(async () => {
    api = await levantarApi();
    await api.importar([
      ...lista(6),
      cancion(7, { artista: 'Faro Azul', genero: 'jazz', anio: 2018, titulo: 'Noche en calma' }),
      cancion(8, { artista: 'faro azul', genero: 'jazz', anio: 2019, titulo: 'Rio de papel' }),
    ], '?esperar=true');
  });
  after(() => api.cerrar());

  it('responde el mensaje base del ejercicio', async () => {
    const r = await api.pedir('/');
    assert.deepEqual(r.cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'importacion masiva' });
  });

  it('lista canciones ordenadas por titulo con paginacion', async () => {
    const r = await api.pedir('/canciones?limite=3');
    assert.equal(r.cuerpo.data.length, 3);
    assert.equal(r.cuerpo.paginacion.total, 8);
    assert.equal(r.cuerpo.paginacion.totalPaginas, 3);
    assert.equal(r.cuerpo.data[0].titulo, 'Noche en calma');
  });

  it('filtra por artista, genero, anio y texto del titulo', async () => {
    assert.equal((await api.pedir('/canciones?artista=FARO AZUL')).cuerpo.paginacion.total, 2);
    assert.equal((await api.pedir('/canciones?genero=jazz')).cuerpo.paginacion.total, 2);
    assert.equal((await api.pedir('/canciones?anio=2018')).cuerpo.paginacion.total, 1);
    assert.equal((await api.pedir('/canciones?q=RIO')).cuerpo.data[0].isrc, isrcDe(8));
    assert.equal((await api.pedir('/canciones?genero=rock&artista=Faro Azul')).cuerpo.paginacion.total, 0);
  });

  it('rechaza filtros invalidos', async () => {
    const r = await api.pedir('/canciones?genero=x&anio=20&limite=0&raro=1');
    assert.equal(r.status, 400);
    assert.deepEqual(r.cuerpo.errores.map((e) => e.campo).sort(), ['anio', 'genero', 'limite', 'raro']);
  });

  it('busca una cancion por isrc con cualquier formato y distingue invalido de inexistente', async () => {
    assert.equal((await api.pedir('/canciones/qz-abc-24-00003')).cuerpo.data.titulo, 'Tema 3');
    assert.equal((await api.pedir('/canciones/nada')).status, 400);
    const falta = await api.pedir('/canciones/QZABC2499999');
    assert.equal(falta.status, 404);
    assert.equal(falta.cuerpo.codigo, 'CANCION_NO_ENCONTRADA');
  });

  it('lista artistas por cantidad de canciones', async () => {
    const r = await api.pedir('/artistas');
    assert.deepEqual(r.cuerpo.data, [{ nombre: 'Luna Roja', canciones: 6 }, { nombre: 'Faro Azul', canciones: 2 }]);
  });

  it('resume el catalogo', async () => {
    const r = await api.pedir('/resumen');
    assert.deepEqual(r.cuerpo.data, {
      canciones: 8, artistas: 2, porGenero: { rock: 6, jazz: 2 }, duracionTotalSeg: 1600, duracionPromedioSeg: 200,
    });
  });

  it('lista importaciones, la mas reciente primero, y filtra por estado', async () => {
    await api.importar(lista(1, 50), '?esperar=true');
    const r = await api.pedir('/importaciones');
    assert.deepEqual(r.cuerpo.data.map((i) => i.id), [2, 1]);
    assert.equal((await api.pedir('/importaciones?estado=fallida')).cuerpo.paginacion.total, 0);
    assert.equal((await api.pedir('/importaciones?estado=completada')).cuerpo.paginacion.total, 2);
    assert.equal((await api.pedir('/importaciones?estado=raro')).status, 400);
    assert.equal((await api.pedir('/importaciones/abc')).status, 400);
    const falta = await api.pedir('/importaciones/99');
    assert.equal(falta.status, 404);
    assert.equal(falta.cuerpo.codigo, 'IMPORTACION_NO_ENCONTRADA');
  });
});

describe('protocolo y errores', () => {
  const errores = [];
  let api;
  before(async () => { api = await levantarApi({ registro: (e) => errores.push(e) }); });
  after(() => api.cerrar());

  it('rutas inexistentes responden 404 en json', async () => {
    const r = await api.pedir('/nada');
    assert.equal(r.status, 404);
    assert.equal(r.cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
  });

  it('OPTIONS responde 204 con Allow y otros metodos 405', async () => {
    const opciones = await api.pedir('/importaciones', { method: 'OPTIONS' });
    assert.equal(opciones.status, 204);
    assert.equal(opciones.cabeceras.get('allow'), 'GET, POST');
    const borrar = await api.pedir('/importaciones/1', { method: 'DELETE' });
    assert.equal(borrar.status, 405);
    assert.equal(borrar.cabeceras.get('allow'), 'GET');
  });

  it('un fallo inesperado devuelve un 500 generico y se registra', async () => {
    api.servicios.canciones.resumen = () => { throw new Error('secreto interno'); };
    const r = await api.pedir('/resumen');
    assert.equal(r.status, 500);
    assert.equal(r.cuerpo.codigo, 'ERROR_INTERNO');
    assert.ok(!JSON.stringify(r.cuerpo).includes('secreto'));
    assert.ok(errores.some((e) => e.mensaje === 'secreto interno'));
  });
});
