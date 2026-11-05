import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi, subir } from '../soporte/api.js';
import { COMBATE_BASE, filasNdjson, lineas, pausa } from '../soporte/entorno.js';

const RUTA = '/avanzado/ejercicio-09/combates/importar';

describe('POST /combates/importar', () => {
  let api;
  before(async () => { api = await levantarApi({ total: 100 }); });
  after(() => api.cerrar());

  it('guarda los combates validos y les da ids nuevos', async () => {
    const antes = api.fuente.cantidad;
    const r = await subir(api.origen, RUTA, [lineas(COMBATE_BASE, { ...COMBATE_BASE, golpesRojo: 99 })]);
    assert.equal(r.status, 201);
    assert.equal(r.cuerpo.data.guardadas, 2);
    assert.equal(r.cuerpo.data.rechazadas, 0);
    assert.deepEqual(r.cuerpo.data.rango, { primero: antes + 1, ultimo: antes + 2 });
    const guardado = await api.pedir(`/combates/${antes + 2}`);
    assert.equal(guardado.cuerpo.data.golpesRojo, 99);
  });

  it('los importados aparecen en la exportacion', async () => {
    await subir(api.origen, RUTA, [lineas({ ...COMBATE_BASE, fecha: '2031-05-05' })]);
    const r = await api.pedir('/combates/exportar?desde=2031-01-01');
    const filas = filasNdjson(r.cuerpo);
    assert.equal(filas.length, 1);
    assert.equal(filas[0].fecha, '2031-05-05');
  });

  it('modo permisivo guarda lo valido y reporta lo rechazado con su numero de linea', async () => {
    const antes = api.fuente.cantidad;
    const cuerpo = lineas(COMBATE_BASE, 'esto no es json', { ...COMBATE_BASE, rounds: 9 }, COMBATE_BASE);
    const r = await subir(api.origen, RUTA, [cuerpo]);
    assert.equal(r.status, 201);
    assert.equal(r.cuerpo.data.recibidas, 4);
    assert.equal(r.cuerpo.data.guardadas, 2);
    assert.equal(r.cuerpo.data.rechazadas, 2);
    assert.deepEqual(r.cuerpo.data.errores.map((e) => e.linea), [2, 3]);
    assert.equal(r.cuerpo.data.errores[1].errores[0].campo, 'rounds');
    assert.equal(api.fuente.cantidad, antes + 2);
  });

  it('modo estricto no guarda nada si hay una sola linea mala', async () => {
    const antes = api.fuente.cantidad;
    const r = await subir(api.origen, `${RUTA}?modo=estricto`, [lineas(COMBATE_BASE, { ...COMBATE_BASE, rojoId: 999 }, COMBATE_BASE)]);
    assert.equal(r.status, 422);
    assert.equal(r.cuerpo.codigo, 'IMPORTACION_RECHAZADA');
    assert.deepEqual(r.cuerpo.contexto, { rechazadas: 1, recibidas: 3 });
    assert.equal(r.cuerpo.errores[0].linea, 2);
    assert.equal(api.fuente.cantidad, antes);
  });

  it('modo estricto con todo valido guarda todo', async () => {
    const antes = api.fuente.cantidad;
    const r = await subir(api.origen, `${RUTA}?modo=estricto`, [lineas(COMBATE_BASE, COMBATE_BASE)]);
    assert.equal(r.status, 201);
    assert.equal(api.fuente.cantidad, antes + 2);
  });

  it('procesa un archivo que llega en trozos que cortan las lineas por la mitad', async () => {
    const antes = api.fuente.cantidad;
    const texto = lineas(COMBATE_BASE, COMBATE_BASE, COMBATE_BASE);
    const trozos = [];
    for (let i = 0; i < texto.length; i += 17) trozos.push(texto.slice(i, i + 17));
    const r = await subir(api.origen, RUTA, trozos, { esperaMs: 2 });
    assert.equal(r.status, 201);
    assert.equal(r.cuerpo.data.guardadas, 3);
    assert.equal(api.fuente.cantidad, antes + 3);
  });

  it('acepta saltos de linea de windows y la ultima linea sin salto', async () => {
    const texto = `${JSON.stringify(COMBATE_BASE)}\r\n${JSON.stringify(COMBATE_BASE)}`;
    const r = await subir(api.origen, RUTA, [texto]);
    assert.equal(r.cuerpo.data.guardadas, 2);
  });

  it('un archivo sin lineas con datos se rechaza', async () => {
    const r = await subir(api.origen, RUTA, ['\n\n   \n']);
    assert.equal(r.status, 422);
    assert.equal(r.cuerpo.codigo, 'IMPORTACION_VACIA');
  });

  it('limita los errores reportados y avisa cuantos se omitieron', async () => {
    const malas = Array.from({ length: 30 }, () => 'mala');
    const r = await subir(api.origen, RUTA, [lineas(...malas)]);
    assert.equal(r.status, 201);
    assert.equal(r.cuerpo.data.guardadas, 0);
    assert.equal(r.cuerpo.data.rechazadas, 30);
    assert.equal(r.cuerpo.data.errores.length, 20);
    assert.equal(r.cuerpo.data.erroresOmitidos, 10);
  });

  it('exige el content-type application/x-ndjson', async () => {
    const r = await subir(api.origen, RUTA, [lineas(COMBATE_BASE)], { tipo: 'text/plain' });
    assert.equal(r.status, 415);
    assert.equal(r.cuerpo.codigo, 'FORMATO_NO_SOPORTADO');
    const json = await api.json('/combates/importar', COMBATE_BASE);
    assert.equal(json.status, 415);
  });

  it('rechaza una linea demasiado larga', async () => {
    const r = await subir(api.origen, RUTA, [lineas(COMBATE_BASE), `${'x'.repeat(3000)}\n`]);
    assert.equal(r.status, 413);
    assert.equal(r.cuerpo.codigo, 'LINEA_DEMASIADO_LARGA');
    assert.equal(r.cuerpo.contexto.linea, 2);
  });

  it('corta un archivo que supera el tamano maximo y no guarda nada', async () => {
    const antes = api.fuente.cantidad;
    const linea = JSON.stringify(COMBATE_BASE);
    const bloque = `${Array.from({ length: 2000 }, () => linea).join('\n')}\n`;
    const trozos = Array.from({ length: 8 }, () => bloque);
    const r = await subir(api.origen, RUTA, trozos);
    assert.equal(r.status, 413);
    assert.equal(r.cuerpo.codigo, 'PAYLOAD_GRANDE');
    assert.equal(api.fuente.cantidad, antes);
  });

  it('si el cliente se desconecta a medias no se guarda nada y el servidor sigue vivo', async () => {
    const antes = api.fuente.cantidad;
    await subir(api.origen, RUTA, [lineas(COMBATE_BASE, COMBATE_BASE)], { abortar: true });
    await pausa(50);
    assert.equal(api.fuente.cantidad, antes);
    const vivo = await api.pedir('/');
    assert.equal(vivo.status, 200);
  });

  it('valida el parametro modo', async () => {
    const r = await subir(api.origen, `${RUTA}?modo=raro`, [lineas(COMBATE_BASE)]);
    assert.equal(r.status, 400);
    assert.equal(r.cuerpo.errores[0].campo, 'modo');
  });

  it('solo acepta POST', async () => {
    const r = await api.pedir('/combates/importar');
    assert.equal(r.status, 405);
    assert.equal(r.cabeceras.get('allow'), 'POST');
  });
});
