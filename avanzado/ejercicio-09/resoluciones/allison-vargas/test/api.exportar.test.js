import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { levantarApi } from '../soporte/api.js';
import { filasNdjson, pausa } from '../soporte/entorno.js';

describe('GET /combates/exportar', () => {
  let api;
  before(async () => { api = await levantarApi({ total: 500 }); });
  after(() => api.cerrar());

  it('exporta ndjson por defecto con las cabeceras de descarga', async () => {
    const r = await api.pedir('/combates/exportar?limite=3');
    assert.equal(r.status, 200);
    assert.equal(r.cabeceras.get('content-type'), 'application/x-ndjson; charset=utf-8');
    assert.equal(r.cabeceras.get('content-disposition'), 'attachment; filename="combates.ndjson"');
    assert.equal(r.cabeceras.get('cache-control'), 'no-store');
    assert.equal(r.cabeceras.get('x-content-type-options'), 'nosniff');
    assert.equal(r.cabeceras.get('transfer-encoding'), 'chunked');
    assert.equal(r.cabeceras.get('content-length'), null);
    const filas = filasNdjson(r.cuerpo);
    assert.deepEqual(filas.map((f) => f.id), [1, 2, 3]);
  });

  it('exporta csv con encabezado y una fila por combate', async () => {
    const r = await api.pedir('/combates/exportar?formato=csv&limite=4');
    assert.equal(r.status, 200);
    assert.equal(r.cabeceras.get('content-type'), 'text/csv; charset=utf-8');
    const filas = r.cuerpo.trimEnd().split('\n');
    assert.equal(filas[0], 'id,fecha,categoria,rojoId,azulId,ganadorId,metodo,rounds,golpesRojo,golpesAzul');
    assert.equal(filas.length, 5);
    assert.equal(filas[1].split(',').length, 10);
  });

  it('exporta todo cuando no se pide limite', async () => {
    const r = await api.pedir('/combates/exportar');
    assert.equal(filasNdjson(r.cuerpo).length, 500);
  });

  it('aplica los filtros', async () => {
    const r = await api.pedir('/combates/exportar?metodo=ko&categoria=pesado&peleadorId=9');
    const filas = filasNdjson(r.cuerpo);
    assert.ok(filas.length > 0);
    for (const f of filas) {
      assert.equal(f.metodo, 'ko');
      assert.equal(f.categoria, 'pesado');
      assert.ok(f.rojoId === 9 || f.azulId === 9);
    }
  });

  it('un filtro sin resultados entrega el archivo vacio y no un error', async () => {
    const ndjson = await api.pedir('/combates/exportar?desde=2000-01-01&hasta=2000-01-02');
    assert.equal(ndjson.status, 200);
    assert.equal(ndjson.cuerpo, null);
    const csv = await api.pedir('/combates/exportar?formato=csv&desde=2000-01-01&hasta=2000-01-02');
    assert.equal(csv.cuerpo.trim(), 'id,fecha,categoria,rojoId,azulId,ganadorId,metodo,rounds,golpesRojo,golpesAzul');
  });

  it('los errores de la consulta se responden como json antes de empezar a transmitir', async () => {
    const r = await api.pedir('/combates/exportar?formato=xml&limite=0');
    assert.equal(r.status, 400);
    assert.match(r.cabeceras.get('content-type'), /application\/json/);
    assert.equal(r.cuerpo.codigo, 'VALIDACION');
    assert.deepEqual(r.cuerpo.errores.map((e) => e.campo), ['formato', 'limite']);
  });

  it('llega en varios trozos y no de una sola vez', async () => {
    const respuesta = await fetch(`${api.origen}/avanzado/ejercicio-09/combates/exportar`);
    let trozos = 0;
    let bytes = 0;
    for await (const trozo of respuesta.body) {
      trozos += 1;
      bytes += trozo.length;
    }
    assert.ok(trozos > 1, `trozos ${trozos}`);
    assert.ok(bytes > 50000);
  });

  it('si el cliente corta la descarga, el servidor deja de leer datos', async () => {
    const grande = await levantarApi({ total: 50000 });
    try {
      const control = new AbortController();
      const respuesta = await fetch(`${grande.origen}/avanzado/ejercicio-09/combates/exportar`, { signal: control.signal });
      const lector = respuesta.body.getReader();
      await lector.read();
      control.abort();
      await lector.read().catch(() => {});
      await pausa(50);
      const antes = grande.fuente.lecturas;
      await pausa(100);
      assert.equal(grande.fuente.lecturas, antes, 'sigue leyendo despues de cortar');
      assert.ok(antes < 5000, `leyo ${antes} de 50000`);
    } finally {
      await grande.cerrar();
    }
  });

  it('el consumidor lento frena al productor', async () => {
    const grande = await levantarApi({ total: 50000 });
    try {
      const respuesta = await new Promise((resolver, rechazar) => {
        http.get(`${grande.origen}/avanzado/ejercicio-09/combates/exportar`, resolver).on('error', rechazar);
      });
      respuesta.pause();
      let anterior = -1;
      let actual = grande.fuente.lecturas;
      for (let i = 0; i < 60 && actual !== anterior; i += 1) {
        anterior = actual;
        await pausa(100);
        actual = grande.fuente.lecturas;
      }
      assert.equal(actual, anterior, 'nunca dejo de producir');
      assert.ok(actual < 50000, `leyo todo (${actual}) aunque nadie consumia`);
      let bytes = 0;
      respuesta.on('data', (trozo) => { bytes += trozo.length; });
      await new Promise((resolver) => { respuesta.on('end', resolver); respuesta.resume(); });
      assert.equal(grande.fuente.lecturas, 50000);
      assert.ok(bytes > 1000000);
    } finally {
      await grande.cerrar();
    }
  });

  it('solo acepta GET', async () => {
    const r = await api.json('/combates/exportar', {});
    assert.equal(r.status, 405);
    assert.equal(r.cabeceras.get('allow'), 'GET');
  });
});
