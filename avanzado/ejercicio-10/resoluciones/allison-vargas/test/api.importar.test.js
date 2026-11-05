import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';
import {
  ENCABEZADO, csv, fila, lineaDe,
} from '../soporte/entorno.js';

describe('POST /partidos/importar', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  const importar = (cuerpo, consulta = '', opciones) => api.enviar(`/partidos/importar${consulta}`, cuerpo, opciones);
  const total = async () => (await api.pedir('/partidos?limite=1')).cuerpo.paginacion.total;

  it('guarda las filas validas y entrega un resumen', async () => {
    const antes = await total();
    const r = await importar(csv(ENCABEZADO, lineaDe(fila()), lineaDe(fila({ local: 'Eva Lara', visita: 'Tito Mena' }))));
    assert.equal(r.status, 201);
    assert.equal(r.cuerpo.data.id, 2);
    assert.equal(r.cuerpo.data.filasLeidas, 2);
    assert.equal(r.cuerpo.data.guardadas, 2);
    assert.equal(r.cuerpo.data.delimitador, ',');
    assert.equal(r.cuerpo.data.delimitadorDetectado, true);
    assert.equal(r.cuerpo.data.origen, 'carga');
    assert.equal(r.cuerpo.data.creadaEn, '2026-11-05T12:00:00.000Z');
    assert.equal(await total(), antes + 2);
  });

  it('detecta punto y coma y acepta comas dentro de campos entre comillas', async () => {
    const cuerpo = csv('Fecha;Local;Visita;Sets Local;Sets Visita;Torneo', '05/10/2026;"Paz, Ana";"Gil, Luis";3;1;"Copa ""Gran"" Final"');
    const r = await importar(cuerpo);
    assert.equal(r.status, 201);
    assert.equal(r.cuerpo.data.delimitador, ';');
    const guardado = (await api.pedir('/partidos?jugador=paz, ana')).cuerpo.data[0];
    assert.equal(guardado.local, 'Paz, Ana');
    assert.equal(guardado.fecha, '2026-10-05');
    assert.equal(guardado.torneo, 'Copa "Gran" Final');
    assert.equal(guardado.puntosLocal, null);
  });

  it('el delimitador indicado manda sobre la deteccion', async () => {
    const cuerpo = csv('fecha|local|visita|setsLocal|setsVisita', '2026-03-01|A, B|C, D|3|0');
    const r = await importar(cuerpo, '?delimitador=barra');
    assert.equal(r.cuerpo.data.delimitador, '|');
    assert.equal(r.cuerpo.data.delimitadorDetectado, false);
    assert.equal(r.cuerpo.data.guardadas, 1);
  });

  it('acepta campos con saltos de linea entre comillas y reporta la linea real de cada fila', async () => {
    const cuerpo = csv(ENCABEZADO, `2026-03-01,"Copa\nde prueba",Eva Lara,Raul Mora,5,3,1,40,30`, lineaDe(fila({ setsLocal: '9' })));
    const r = await importar(cuerpo);
    assert.equal(r.cuerpo.data.guardadas, 1);
    assert.equal(r.cuerpo.data.errores[0].fila, 4);
  });

  it('modo permisivo guarda lo valido y reporta lo malo por linea y campo', async () => {
    const cuerpo = csv(
      ENCABEZADO,
      lineaDe(fila()),
      lineaDe(fila({ fecha: '2026-02-30', local: 'Otro Uno', visita: 'Otro Dos' })),
      lineaDe(fila({ local: 'Mas Uno', visita: 'Mas Dos', setsLocal: '2' })),
      '2026-03-01,Copa,Corta',
    );
    const r = await importar(cuerpo);
    assert.equal(r.status, 201);
    assert.equal(r.cuerpo.data.guardadas, 1);
    assert.equal(r.cuerpo.data.rechazadas, 3);
    assert.deepEqual(r.cuerpo.data.errores.map((e) => e.fila), [3, 4, 5]);
    assert.equal(r.cuerpo.data.errores[0].errores[0].campo, 'fecha');
    assert.equal(r.cuerpo.data.errores[2].errores[0].campo, 'fila');
  });

  it('modo estricto no guarda nada si una fila es mala', async () => {
    const antes = await total();
    const r = await importar(csv(ENCABEZADO, lineaDe(fila()), lineaDe(fila({ setsLocal: 'x' }))), '?modo=estricto');
    assert.equal(r.status, 422);
    assert.equal(r.cuerpo.codigo, 'IMPORTACION_RECHAZADA');
    assert.deepEqual(r.cuerpo.contexto, { rechazadas: 1, leidas: 2 });
    assert.equal(r.cuerpo.errores[0].fila, 3);
    assert.equal(await total(), antes);
    assert.equal((await api.pedir('/importaciones')).cuerpo.paginacion.total, 1);
  });

  it('dryRun valida sin guardar ni registrar la importacion', async () => {
    const antes = await total();
    const r = await importar(csv(ENCABEZADO, lineaDe(fila()), lineaDe(fila({ setsLocal: 'x' }))), '?dryRun=true');
    assert.equal(r.status, 200);
    assert.equal(r.cuerpo.data.dryRun, true);
    assert.equal(r.cuerpo.data.validas, 1);
    assert.equal(r.cuerpo.data.guardadas, 0);
    assert.equal(r.cuerpo.data.rechazadas, 1);
    assert.equal(r.cuerpo.data.id, undefined);
    assert.equal(await total(), antes);
    assert.equal((await api.pedir('/importaciones')).cuerpo.paginacion.total, 1);
  });

  it('salta los duplicados del archivo y los que ya existian, tambien con los jugadores invertidos', async () => {
    const cuerpo = csv(
      ENCABEZADO,
      lineaDe(fila()),
      lineaDe(fila()),
      lineaDe(fila({ local: 'RAUL MORA', visita: 'eva lara' })),
      '2026-01-10,Copa Verano,Luis Gil,Ana Paz,5,1,3,30,45',
    );
    const r = await importar(cuerpo);
    assert.equal(r.cuerpo.data.guardadas, 1);
    assert.equal(r.cuerpo.data.duplicadas, 3);
    assert.deepEqual(r.cuerpo.data.filasDuplicadas, [3, 4, 5]);
  });

  it('informa columnas ignoradas y acepta columnas en cualquier orden', async () => {
    const cuerpo = csv('visita,arbitro,setsVisita,local,setsLocal,fecha', 'Raul Mora,Pepe,1,Eva Lara,3,2026-03-01');
    const r = await importar(cuerpo);
    assert.equal(r.cuerpo.data.guardadas, 1);
    assert.deepEqual(r.cuerpo.data.columnasIgnoradas, ['arbitro']);
    assert.equal((await api.pedir(`/partidos/${r.cuerpo.data.id === 2 ? 5 : 0}`)).cuerpo.data.local, 'Eva Lara');
  });

  it('acepta BOM y avisa que lo traia', async () => {
    const cuerpo = Buffer.from(`\uFEFF${csv(ENCABEZADO, lineaDe(fila()))}`);
    const r = await importar(cuerpo);
    assert.equal(r.status, 201);
    assert.equal(r.cuerpo.data.bom, true);
  });

  it('lee archivos latin1 cuando el content-type lo indica', async () => {
    const cuerpo = Buffer.from(csv(ENCABEZADO, lineaDe(fila({ local: 'Jos\u00E9 Pe\u00F1a' }))), 'latin1');
    const r = await importar(cuerpo, '', { tipo: 'text/csv; charset=iso-8859-1' });
    assert.equal(r.status, 201);
    assert.equal(r.cuerpo.data.codificacion, 'iso-8859-1');
    assert.equal((await api.pedir('/partidos?jugador=jose pena')).cuerpo.data[0].local, 'Jos\u00E9 Pe\u00F1a');
  });

  it('rechaza bytes que no son utf-8 y charsets desconocidos', async () => {
    const latin1 = Buffer.from(csv(ENCABEZADO, lineaDe(fila({ local: 'Jos\u00E9 Pe\u00F1a' }))), 'latin1');
    const malo = await importar(latin1);
    assert.equal(malo.status, 400);
    assert.equal(malo.cuerpo.codigo, 'CODIFICACION_INVALIDA');
    const raro = await importar('a,b', '', { tipo: 'text/csv; charset=shift_jis' });
    assert.equal(raro.cuerpo.codigo, 'CODIFICACION_INVALIDA');
  });

  it('rechaza archivos vacios, solo con encabezado o solo con lineas en blanco', async () => {
    for (const cuerpo of ['', '\n\n  \n', `${ENCABEZADO}\n`, `${ENCABEZADO}\n\n,,,,,,,,\n`]) {
      const r = await importar(cuerpo);
      assert.equal(r.status, 422, JSON.stringify(cuerpo));
      assert.equal(r.cuerpo.codigo, 'CSV_VACIO');
    }
  });

  it('encabezados invalidos responden con un detalle por problema y no guardan nada', async () => {
    const antes = await total();
    const r = await importar(csv('fecha,local,jugador1,puntosLocal', '2026-03-01,A,B,10'));
    assert.equal(r.status, 422);
    assert.equal(r.cuerpo.codigo, 'ENCABEZADOS_INVALIDOS');
    assert.deepEqual(r.cuerpo.errores.map((e) => e.campo), ['visita', 'setsLocal', 'setsVisita', 'local', 'puntosLocal']);
    assert.equal(await total(), antes);
  });

  it('un csv mal formado indica la linea del problema', async () => {
    const r = await importar(csv(ENCABEZADO, lineaDe(fila()), '2026-03-01,"Copa sin cerrar,Eva,Raul,5,3,1,40,30'));
    assert.equal(r.status, 422);
    assert.equal(r.cuerpo.codigo, 'CSV_MAL_FORMADO');
    assert.equal(r.cuerpo.contexto.linea, 3);
  });

  it('limita los errores reportados y cuenta los omitidos', async () => {
    const malas = Array.from({ length: 60 }, (_, i) => lineaDe(fila({ local: `Jugador ${i}`, setsLocal: 'x' })));
    const r = await importar(csv(ENCABEZADO, ...malas));
    assert.equal(r.cuerpo.data.rechazadas, 60);
    assert.equal(r.cuerpo.data.errores.length, 50);
    assert.equal(r.cuerpo.data.erroresOmitidos, 10);
  });

  it('rechaza archivos con demasiadas filas', async () => {
    const filas = Array.from({ length: 5001 }, (_, i) => lineaDe(fila({ local: `J${i}` })));
    const r = await importar(csv(ENCABEZADO, ...filas));
    assert.equal(r.status, 413);
    assert.equal(r.cuerpo.codigo, 'LIMITE_DE_FILAS');
  });

  it('rechaza archivos de mas de 1 MB', async () => {
    const r = await importar(Buffer.alloc(1024 * 1024 + 10, 97));
    assert.equal(r.status, 413);
    assert.equal(r.cuerpo.codigo, 'PAYLOAD_GRANDE');
  });

  it('exige text/csv', async () => {
    for (const tipo of ['application/json', 'text/plain', null]) {
      const r = await importar(csv(ENCABEZADO, lineaDe(fila())), '', { tipo });
      assert.equal(r.status, 415, String(tipo));
      assert.equal(r.cuerpo.codigo, 'FORMATO_NO_SOPORTADO');
    }
  });

  it('valida las opciones de la consulta', async () => {
    const r = await importar(csv(ENCABEZADO, lineaDe(fila())), '?modo=raro&delimitador=espacio&dryRun=si&otro=1');
    assert.equal(r.status, 400);
    assert.deepEqual(r.cuerpo.errores.map((e) => e.campo).sort(), ['delimitador', 'dryRun', 'modo', 'otro']);
  });

  it('guarda el nombre del archivo si se manda', async () => {
    const r = await importar(csv(ENCABEZADO, lineaDe(fila())), '?nombre=torneo-marzo.csv');
    assert.equal(r.cuerpo.data.nombre, 'torneo-marzo.csv');
  });
});

describe('POST /csv/analizar', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  it('describe el archivo sin guardar nada', async () => {
    const r = await api.enviar('/csv/analizar', csv('Fecha;Local;Visita;Sets Local;Sets Visita;Arbitro', '2026-03-01;A;B;3;1;Pepe', '2026-03-02;C;D;3;2', '2026-03-03;E;F;3;0;Ana'));
    assert.equal(r.status, 200);
    const d = r.cuerpo.data;
    assert.equal(d.delimitador, ';');
    assert.deepEqual(d.columnasReconocidas, ['fecha', 'local', 'visita', 'setsLocal', 'setsVisita']);
    assert.deepEqual(d.columnasIgnoradas, ['Arbitro']);
    assert.equal(d.filas, 3);
    assert.deepEqual(d.filasConColumnasDistintas, [3]);
    assert.equal(d.vistaPrevia.length, 3);
    assert.equal(d.listoParaImportar, true);
    assert.equal((await api.pedir('/partidos?limite=1')).cuerpo.paginacion.total, 4);
  });

  it('avisa lo que falta sin lanzar error', async () => {
    const r = await api.enviar('/csv/analizar', csv('a,b', '1,2'));
    assert.equal(r.status, 200);
    assert.equal(r.cuerpo.data.listoParaImportar, false);
    assert.deepEqual(r.cuerpo.data.columnasFaltantes, ['fecha', 'local', 'visita', 'setsLocal', 'setsVisita']);
  });

  it('limita la vista previa a 5 filas', async () => {
    const filas = Array.from({ length: 12 }, (_, i) => `${i},x`);
    const r = await api.enviar('/csv/analizar', csv('a,b', ...filas));
    assert.equal(r.cuerpo.data.vistaPrevia.length, 5);
    assert.equal(r.cuerpo.data.filas, 12);
  });

  it('responde los mismos errores de lectura que importar', async () => {
    assert.equal((await api.enviar('/csv/analizar', '')).cuerpo.codigo, 'CSV_VACIO');
    assert.equal((await api.enviar('/csv/analizar', 'a,"b')).cuerpo.codigo, 'CSV_MAL_FORMADO');
    assert.equal((await api.enviar('/csv/analizar', 'a', { tipo: 'text/plain' })).status, 415);
    assert.equal((await api.pedir('/csv/analizar')).status, 405);
  });
});
