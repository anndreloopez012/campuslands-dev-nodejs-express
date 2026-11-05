import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { gunzipSync } from 'node:zlib';
import { levantarApi } from '../soporte/api.js';
import { NUEVA, pausa, sinteticas } from '../soporte/entorno.js';

let api;
before(async () => { api = await levantarApi(); });
after(async () => { await api.cerrar(); });

describe('exportacion', () => {
  it('por defecto devuelve un arreglo json con los 15 campos', async () => {
    const r = await api.texto('/peliculas/exportar', { 'accept-encoding': 'identity' });
    assert.equal(r.status, 200);
    assert.match(r.cabeceras['content-type'], /^application\/json/);
    const datos = JSON.parse(r.texto);
    assert.equal(datos.length, 60);
    assert.equal(Object.keys(datos[0]).length, 15);
    assert.equal(r.cabeceras['x-total-registros'], '60');
    assert.equal(r.cabeceras['x-content-type-options'], 'nosniff');
    assert.equal(r.cabeceras['cache-control'], 'private, no-cache');
    assert.match(r.cabeceras['content-disposition'], /^attachment; filename="peliculas-miedo-20261105\.json"$/);
  });

  it('el envoltorio trae meta con el total, los filtros y la version', async () => {
    const r = await api.texto('/peliculas/exportar?forma=envoltorio&subgenero=gore&campos=id,titulo&pretty=true', { 'accept-encoding': 'identity' });
    const cuerpo = JSON.parse(r.texto);
    assert.equal(cuerpo.meta.coleccion, 'peliculas');
    assert.equal(cuerpo.meta.total, cuerpo.datos.length);
    assert.equal(cuerpo.meta.filtros.subgenero, 'gore');
    assert.deepEqual(cuerpo.meta.campos, ['id', 'titulo']);
    assert.equal(cuerpo.meta.version, 1);
    assert.ok(r.texto.includes('\n  "meta": {'));
    assert.equal(r.texto, JSON.stringify(cuerpo, null, 2));
  });

  it('ndjson devuelve una pelicula por linea', async () => {
    const r = await api.texto('/peliculas/exportar?forma=ndjson&limite=5&campos=id', { 'accept-encoding': 'identity' });
    assert.match(r.cabeceras['content-type'], /^application\/x-ndjson/);
    assert.match(r.cabeceras['content-disposition'], /\.ndjson"$/);
    assert.deepEqual(r.texto.trim().split('\n').map((l) => JSON.parse(l)), [1, 2, 3, 4, 5].map((id) => ({ id })));
  });

  it('descargar=false no manda Content-Disposition', async () => {
    const r = await api.crudo('/peliculas/exportar?descargar=false&limite=1', { 'accept-encoding': 'identity' });
    assert.equal(r.cabeceras['content-disposition'], undefined);
  });

  it('incluye director, reparto y ganancia', async () => {
    const r = await api.texto('/peliculas/exportar?incluir=director,reparto,ganancia&campos=id,director,reparto,ganancia&limite=2', { 'accept-encoding': 'identity' });
    const [primera] = JSON.parse(r.texto);
    assert.deepEqual(Object.keys(primera.director), ['id', 'nombre', 'pais']);
    assert.ok(primera.reparto.length >= 1);
    assert.equal(typeof primera.ganancia, 'number');
  });

  it('ordena y limita', async () => {
    const r = await api.texto('/peliculas/exportar?orden=calificacion:desc&campos=id,calificacion&limite=10', { 'accept-encoding': 'identity' });
    const datos = JSON.parse(r.texto);
    assert.equal(datos.length, 10);
    for (let i = 1; i < datos.length; i += 1) assert.ok(datos[i - 1].calificacion >= datos[i].calificacion);
  });

  it('filtra por anio, calificacion, clasificacion y texto', async () => {
    const r = await api.texto('/peliculas/exportar?desde=2000&hasta=2010&calificacionMin=6&clasificacion=%2B16&campos=anio,calificacion,clasificacion', { 'accept-encoding': 'identity' });
    const datos = JSON.parse(r.texto);
    assert.ok(datos.length > 0);
    for (const d of datos) {
      assert.ok(d.anio >= 2000 && d.anio <= 2010 && d.calificacion >= 6 && d.clasificacion === '+16');
    }
    const q = await api.texto('/peliculas/exportar?q=NOCHE&campos=titulo', { 'accept-encoding': 'identity' });
    for (const d of JSON.parse(q.texto)) assert.match(d.titulo.toLowerCase(), /noche/);
  });

  it('una exportacion vacia sigue siendo json valido', async () => {
    const r = await api.texto('/peliculas/exportar?q=zzzzzz&forma=envoltorio', { 'accept-encoding': 'identity' });
    const cuerpo = JSON.parse(r.texto);
    assert.deepEqual(cuerpo.datos, []);
    assert.equal(cuerpo.meta.total, 0);
    const a = await api.texto('/peliculas/exportar?q=zzzzzz', { 'accept-encoding': 'identity' });
    assert.equal(a.texto, '[]');
  });

  it('el esquema describe los campos pedidos', async () => {
    const r = await api.pedir('/peliculas/exportar/esquema?campos=id,titulo');
    assert.equal(r.status, 200);
    assert.match(r.cabeceras.get('content-type'), /^application\/schema\+json/);
    assert.deepEqual(Object.keys(r.cuerpo.properties), ['id', 'titulo']);
  });

  it('valida los parametros con 400 y detalle', async () => {
    const r = await api.pedir('/peliculas/exportar?forma=xml&limite=0&raro=1');
    assert.equal(r.status, 400);
    assert.equal(r.cuerpo.codigo, 'VALIDACION');
    assert.equal(r.cuerpo.errores.length, 3);
    const p = await api.pedir('/peliculas/exportar?forma=ndjson&pretty=true');
    assert.equal(p.status, 400);
  });
});

describe('compresion y cache', () => {
  it('comprime con gzip cuando el cliente lo acepta', async () => {
    const r = await api.crudo('/peliculas/exportar', { 'accept-encoding': 'gzip' });
    assert.equal(r.cabeceras['content-encoding'], 'gzip');
    assert.equal(r.cabeceras.vary, 'Accept-Encoding');
    assert.equal(JSON.parse(gunzipSync(r.cuerpo).toString()).length, 60);
    assert.match(r.cabeceras.etag, /-gz"$/);
  });

  it('no comprime con identity ni con compresion=ninguna', async () => {
    const a = await api.crudo('/peliculas/exportar', { 'accept-encoding': 'identity' });
    assert.equal(a.cabeceras['content-encoding'], undefined);
    const b = await api.crudo('/peliculas/exportar?compresion=ninguna', { 'accept-encoding': 'gzip' });
    assert.equal(b.cabeceras['content-encoding'], undefined);
    assert.equal(JSON.parse(b.cuerpo.toString()).length, 60);
  });

  it('el contenido comprimido y el plano son el mismo json', async () => {
    const plano = await api.texto('/peliculas/exportar?forma=envoltorio', { 'accept-encoding': 'identity' });
    const gz = await api.texto('/peliculas/exportar?forma=envoltorio', { 'accept-encoding': 'gzip' });
    assert.equal(gz.texto, plano.texto);
  });

  it('responde 304 con If-None-Match y con If-Modified-Since', async () => {
    const primera = await api.crudo('/peliculas/exportar?limite=3', { 'accept-encoding': 'identity' });
    const { etag } = primera.cabeceras;
    const ultima = primera.cabeceras['last-modified'];
    assert.ok(etag && ultima);
    const a = await api.crudo('/peliculas/exportar?limite=3', { 'accept-encoding': 'identity', 'if-none-match': etag });
    assert.equal(a.status, 304);
    assert.equal(a.cuerpo.length, 0);
    const b = await api.crudo('/peliculas/exportar?limite=3', { 'accept-encoding': 'identity', 'if-modified-since': ultima });
    assert.equal(b.status, 304);
    const c = await api.crudo('/peliculas/exportar?limite=4', { 'accept-encoding': 'identity', 'if-none-match': etag });
    assert.equal(c.status, 200);
  });

  it('el etag cambia con los parametros y con la version del catalogo', async () => {
    const a = await api.crudo('/peliculas/exportar?campos=id', { 'accept-encoding': 'identity' });
    const b = await api.crudo('/peliculas/exportar?campos=id,titulo', { 'accept-encoding': 'identity' });
    assert.notEqual(a.cabeceras.etag, b.cabeceras.etag);
    const otra = await levantarApi();
    try {
      const antes = await otra.crudo('/peliculas/exportar?campos=id', { 'accept-encoding': 'identity' });
      otra.avanzar(1000);
      const creada = await otra.crear(NUEVA);
      assert.equal(creada.status, 201);
      const despues = await otra.crudo('/peliculas/exportar?campos=id', { 'accept-encoding': 'identity', 'if-none-match': antes.cabeceras.etag });
      assert.equal(despues.status, 200);
      assert.notEqual(despues.cabeceras.etag, antes.cabeceras.etag);
      assert.equal(JSON.parse(despues.cuerpo.toString()).length, 61);
      const baja = await otra.pedir('/peliculas/61', { method: 'DELETE' });
      assert.equal(baja.status, 200);
      const final = await otra.crudo('/peliculas/exportar?campos=id', { 'accept-encoding': 'identity' });
      assert.equal(JSON.parse(final.cuerpo.toString()).length, 60);
      assert.notEqual(final.cabeceras.etag, antes.cabeceras.etag);
    } finally {
      await otra.cerrar();
    }
  });
});

describe('streaming', () => {
  it('serializa las filas a medida que el cliente lee (contrapresion)', async () => {
    let serializadas = 0;
    const grande = await levantarApi({ peliculas: sinteticas(20000), alSerializar: () => { serializadas += 1; } });
    try {
      const url = `${grande.origen}/avanzado/ejercicio-12/peliculas/exportar?limite=20000&compresion=ninguna`;
      const llegado = await new Promise((resolver, rechazar) => {
        http.get(url, (respuesta) => {
          respuesta.pause();
          let anterior = -1;
          const revisar = async () => {
            await pausa(60);
            if (serializadas === anterior) {
              respuesta.destroy();
              resolver(serializadas);
              return;
            }
            anterior = serializadas;
            revisar();
          };
          revisar();
        }).on('error', rechazar);
      });
      assert.ok(llegado > 0, 'debio empezar a serializar');
      assert.ok(llegado < 20000, `serializo ${llegado} filas con un lector detenido`);
    } finally {
      await grande.cerrar();
    }
  });

  it('un volumen grande llega completo y en varios trozos', async () => {
    const grande = await levantarApi({ peliculas: sinteticas(3000) });
    try {
      const r = await grande.crudo('/peliculas/exportar?limite=3000&compresion=ninguna');
      assert.equal(JSON.parse(r.cuerpo.toString()).length, 3000);
      assert.ok(r.trozos > 1);
      assert.equal(r.cabeceras['content-length'], undefined);
    } finally {
      await grande.cerrar();
    }
  });

  it('si el cliente aborta se deja de serializar', async () => {
    let serializadas = 0;
    const grande = await levantarApi({ peliculas: sinteticas(20000), alSerializar: () => { serializadas += 1; } });
    try {
      await new Promise((resolver, rechazar) => {
        const pedido = http.get(`${grande.origen}/avanzado/ejercicio-12/peliculas/exportar?limite=20000&compresion=ninguna`, (respuesta) => {
          respuesta.once('data', () => {
            pedido.destroy();
            resolver();
          });
        });
        pedido.on('error', () => {});
        pedido.on('close', resolver);
        setTimeout(() => rechazar(new Error('sin datos')), 5000).unref();
      });
      await pausa(150);
      const tras = serializadas;
      await pausa(150);
      assert.equal(serializadas, tras);
      assert.ok(tras < 20000);
    } finally {
      await grande.cerrar();
    }
  });
});
