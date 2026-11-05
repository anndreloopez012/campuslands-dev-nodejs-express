import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';
import {
  ENCABEZADO, csv, fila, lineaDe,
} from '../soporte/entorno.js';
import { parsearCsv } from '../src/domain/csv.js';

describe('consultas', () => {
  let api;
  before(async () => { api = await levantarApi(); });
  after(() => api.cerrar());

  it('responde el mensaje base del ejercicio', async () => {
    const r = await api.pedir('/');
    assert.deepEqual(r.cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'lectura de CSV' });
  });

  it('la semilla se carga leyendo el csv con el mismo importador', async () => {
    const r = await api.pedir('/importaciones/1');
    assert.equal(r.cuerpo.data.origen, 'semilla');
    assert.equal(r.cuerpo.data.guardadas, 4);
    assert.equal((await api.pedir('/partidos')).cuerpo.paginacion.total, 4);
  });

  it('el servidor por defecto arranca con los 60 partidos del archivo de ejemplo', async () => {
    const { crearServicios } = await import('../src/services/index.js');
    const servicios = crearServicios({ reloj: () => new Date('2026-11-05T00:00:00Z') });
    assert.equal(servicios.partidos.listar({ pagina: 1, limite: 1, filtros: {} }).paginacion.total, 60);
    assert.equal(servicios.importaciones.obtener(1).rechazadas, 0);
  });

  it('lista partidos del mas reciente al mas antiguo', async () => {
    const r = await api.pedir('/partidos');
    assert.deepEqual(r.cuerpo.data.map((p) => p.fecha), ['2026-02-01', '2026-01-12', '2026-01-11', '2026-01-10']);
  });

  it('filtra por jugador sin importar acentos ni mayusculas, torneo y fechas', async () => {
    assert.equal((await api.pedir('/partidos?jugador=ANA PAZ')).cuerpo.paginacion.total, 3);
    assert.equal((await api.pedir('/partidos?torneo=copa verano')).cuerpo.paginacion.total, 2);
    assert.equal((await api.pedir('/partidos?desde=2026-01-11&hasta=2026-01-12')).cuerpo.paginacion.total, 2);
    assert.equal((await api.pedir('/partidos?importacionId=1')).cuerpo.paginacion.total, 4);
    assert.equal((await api.pedir('/partidos?importacionId=9')).cuerpo.paginacion.total, 0);
  });

  it('pagina los resultados', async () => {
    const r = await api.pedir('/partidos?pagina=2&limite=3');
    assert.equal(r.cuerpo.data.length, 1);
    assert.equal(r.cuerpo.paginacion.totalPaginas, 2);
  });

  it('rechaza filtros invalidos', async () => {
    const r = await api.pedir('/partidos?desde=2026-02-31&hasta=ayer&limite=0&importacionId=x&raro=1');
    assert.equal(r.status, 400);
    assert.deepEqual(r.cuerpo.errores.map((e) => e.campo).sort(), ['desde', 'hasta', 'importacionId', 'limite', 'raro']);
    assert.equal((await api.pedir('/partidos?desde=2026-02-01&hasta=2026-01-01')).status, 400);
  });

  it('obtiene un partido y distingue id invalido de inexistente', async () => {
    const r = await api.pedir('/partidos/1');
    assert.equal(r.cuerpo.data.local, 'Ana Paz');
    assert.equal(r.cuerpo.data.ganador, 'local');
    assert.equal((await api.pedir('/partidos/abc')).status, 400);
    const falta = await api.pedir('/partidos/99');
    assert.equal(falta.status, 404);
    assert.equal(falta.cuerpo.codigo, 'PARTIDO_NO_ENCONTRADO');
  });

  it('ranking ordenado con porcentajes', async () => {
    const r = await api.pedir('/jugadores/ranking');
    assert.deepEqual(r.cuerpo.data.map((j) => [j.posicion, j.nombre, j.victorias]), [[1, 'Ana Paz', 2], [2, 'Luis Gil', 1], [3, 'Marta Ruiz', 1]]);
    assert.equal(r.cuerpo.data[0].porcentajeVictorias, 66.67);
    assert.equal(r.cuerpo.data[0].diferenciaDeSets, 3);
  });

  it('ranking con filtros y validaciones', async () => {
    const r = await api.pedir('/jugadores/ranking?torneo=Copa Verano&minPartidos=2&limite=1');
    assert.deepEqual(r.cuerpo.data.map((j) => j.nombre), ['Luis Gil']);
    assert.equal((await api.pedir('/jugadores/ranking?limite=100&minPartidos=x&raro=1')).status, 400);
  });

  it('historial de un jugador con su resumen', async () => {
    const r = await api.pedir('/jugadores/marta%20ruiz');
    assert.equal(r.cuerpo.data.resumen.nombre, 'Marta Ruiz');
    assert.equal(r.cuerpo.data.resumen.partidos, 3);
    assert.equal(r.cuerpo.data.ultimosPartidos[0].fecha, '2026-02-01');
    const falta = await api.pedir('/jugadores/nadie');
    assert.equal(falta.status, 404);
    assert.equal(falta.cuerpo.codigo, 'JUGADOR_NO_ENCONTRADO');
  });

  it('enfrentamientos entre dos jugadores', async () => {
    const r = await api.pedir('/jugadores/enfrentamientos?a=ana paz&b=Marta Ruiz');
    assert.equal(r.cuerpo.data.partidos, 2);
    assert.equal(r.cuerpo.data.victoriasA, 1);
    assert.equal(r.cuerpo.data.victoriasB, 1);
    assert.equal((await api.pedir('/jugadores/enfrentamientos?a=x')).status, 400);
    assert.equal((await api.pedir('/jugadores/enfrentamientos?a=Ana&b=ana')).status, 400);
    assert.equal((await api.pedir('/jugadores/enfrentamientos?a=Ana%20Paz&b=Nadie')).cuerpo.data.partidos, 0);
  });
});

describe('exportar', () => {
  let api;
  before(async () => { api = await levantarApi(); });
  after(() => api.cerrar());

  it('exporta csv con las cabeceras de descarga', async () => {
    const r = await api.pedir('/partidos/exportar');
    assert.equal(r.status, 200);
    assert.equal(r.cabeceras.get('content-type'), 'text/csv; charset=utf-8');
    assert.equal(r.cabeceras.get('content-disposition'), 'attachment; filename="partidos.csv"');
    assert.equal(r.cabeceras.get('x-total-filas'), '4');
    const filas = parsearCsv(r.cuerpo).map((f) => f.campos);
    assert.equal(filas.length, 5);
    assert.equal(filas[0].join(','), 'id,fecha,torneo,mesa,local,visita,mejorDe,setsLocal,setsVisita,puntosLocal,puntosVisita');
  });

  it('respeta delimitador, bom y filtros', async () => {
    const r = await fetch(`${api.origen}/avanzado/ejercicio-10/partidos/exportar?delimitador=puntoycoma&bom=true&jugador=Luis%20Gil`);
    const bytes = Buffer.from(await r.arrayBuffer());
    assert.deepEqual([...bytes.subarray(0, 3)], [0xef, 0xbb, 0xbf]);
    const texto = bytes.subarray(3).toString('utf8');
    assert.ok(texto.startsWith('id;fecha'));
    assert.equal(texto.trim().split('\r\n').length, 3);
  });

  it('lo exportado se puede volver a importar y da los mismos partidos', async () => {
    const original = await levantarApi();
    const copia = await levantarApi({ semilla: '' });
    try {
      const exportado = (await original.pedir('/partidos/exportar?delimitador=puntoycoma')).cuerpo;
      const r = await copia.enviar('/partidos/importar', exportado);
      assert.equal(r.status, 201);
      assert.equal(r.cuerpo.data.guardadas, 4);
      assert.equal(r.cuerpo.data.delimitador, ';');
      const quitarIds = (lista) => lista.map(({ id, importacionId, ...resto }) => resto);
      const a = (await original.pedir('/partidos?limite=50')).cuerpo.data;
      const b = (await copia.pedir('/partidos?limite=50')).cuerpo.data;
      assert.deepEqual(quitarIds(b), quitarIds(a));
    } finally {
      await original.cerrar();
      await copia.cerrar();
    }
  });

  it('un torneo con comas y comillas sobrevive al viaje de ida y vuelta', async () => {
    const origen = await levantarApi({ semilla: '' });
    const destino = await levantarApi({ semilla: '' });
    try {
      const torneo = 'Gran "Final", zona norte';
      await origen.enviar('/partidos/importar', csv(ENCABEZADO, `2026-03-01,"${torneo.replaceAll('"', '""')}",Eva Lara,Raul Mora,5,3,1,40,30`));
      const exportado = (await origen.pedir('/partidos/exportar')).cuerpo;
      await destino.enviar('/partidos/importar', exportado);
      assert.equal((await destino.pedir('/partidos/1')).cuerpo.data.torneo, torneo);
    } finally {
      await origen.cerrar();
      await destino.cerrar();
    }
  });

  it('valida los parametros', async () => {
    const r = await api.pedir('/partidos/exportar?delimitador=auto&bom=quizas&x=1');
    assert.equal(r.status, 400);
    assert.deepEqual(r.cuerpo.errores.map((e) => e.campo).sort(), ['bom', 'delimitador', 'x']);
  });
});

describe('importaciones', () => {
  let api;
  before(async () => { api = await levantarApi(); });
  after(() => api.cerrar());

  it('lista y consulta importaciones con su detalle de errores', async () => {
    await api.enviar('/partidos/importar?nombre=marzo.csv', csv(ENCABEZADO, lineaDe(fila()), lineaDe(fila({ local: 'Mal Uno', visita: 'Mal Dos', setsLocal: 'x' }))));
    const lista = await api.pedir('/importaciones');
    assert.deepEqual(lista.cuerpo.data.map((i) => i.id), [2, 1]);
    assert.equal(lista.cuerpo.data[0].errores, undefined);
    const detalle = await api.pedir('/importaciones/2');
    assert.equal(detalle.cuerpo.data.nombre, 'marzo.csv');
    assert.equal(detalle.cuerpo.data.errores.length, 1);
    assert.equal((await api.pedir('/importaciones/99')).cuerpo.codigo, 'IMPORTACION_NO_ENCONTRADA');
  });

  it('revertir quita solo los partidos de esa importacion y libera los duplicados', async () => {
    const antes = (await api.pedir('/partidos?limite=1')).cuerpo.paginacion.total;
    const r = await api.pedir('/importaciones/2', { method: 'DELETE' });
    assert.equal(r.status, 200);
    assert.equal(r.cuerpo.data.partidosEliminados, 1);
    assert.equal(r.cuerpo.data.importacion.revertida, true);
    assert.equal((await api.pedir('/partidos?limite=1')).cuerpo.paginacion.total, antes - 1);
    const otra = await api.enviar('/partidos/importar', csv(ENCABEZADO, lineaDe(fila())));
    assert.equal(otra.cuerpo.data.guardadas, 1);
    assert.equal(otra.cuerpo.data.duplicadas, 0);
  });

  it('no se puede revertir dos veces', async () => {
    const r = await api.pedir('/importaciones/2', { method: 'DELETE' });
    assert.equal(r.status, 409);
    assert.equal(r.cuerpo.codigo, 'IMPORTACION_YA_REVERTIDA');
    assert.equal((await api.pedir('/importaciones/99', { method: 'DELETE' })).status, 404);
  });

  it('valida la paginacion', async () => {
    assert.equal((await api.pedir('/importaciones?limite=0&x=1')).status, 400);
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
    const opciones = await api.pedir('/partidos/importar', { method: 'OPTIONS' });
    assert.equal(opciones.status, 204);
    assert.equal(opciones.cabeceras.get('allow'), 'POST');
    const borrar = await api.pedir('/partidos', { method: 'DELETE' });
    assert.equal(borrar.status, 405);
    assert.equal(borrar.cabeceras.get('allow'), 'GET');
  });

  it('un fallo inesperado devuelve un 500 generico y se registra', async () => {
    api.servicios.jugadores.ranking = () => { throw new Error('secreto interno'); };
    const r = await api.pedir('/jugadores/ranking');
    assert.equal(r.status, 500);
    assert.equal(r.cuerpo.codigo, 'ERROR_INTERNO');
    assert.ok(!JSON.stringify(r.cuerpo).includes('secreto'));
    assert.ok(errores.some((e) => e.mensaje === 'secreto interno'));
  });
});
