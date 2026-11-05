import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { levantarApi } from '../soporte/api.js';
import { NUEVA } from '../soporte/entorno.js';

let api;
before(async () => { api = await levantarApi(); });
after(async () => { await api.cerrar(); });

describe('peliculas', () => {
  it('lista con paginacion y filtros', async () => {
    const r = await api.pedir('/peliculas?limite=5&pagina=2&orden=titulo:asc');
    assert.equal(r.status, 200);
    assert.equal(r.cuerpo.data.length, 5);
    assert.equal(r.cuerpo.paginacion.pagina, 2);
    assert.equal(r.cuerpo.paginacion.total, 60);
    const f = await api.pedir('/peliculas?subgenero=zombis');
    for (const p of f.cuerpo.data) assert.equal(p.subgenero, 'zombis');
  });

  it('rechaza parametros invalidos al listar', async () => {
    const r = await api.pedir('/peliculas?limite=0&orden=x');
    assert.equal(r.status, 400);
    assert.equal(r.cuerpo.codigo, 'VALIDACION');
  });

  it('obtiene una pelicula y responde 404 si no existe', async () => {
    const r = await api.pedir('/peliculas/1');
    assert.equal(r.status, 200);
    assert.equal(r.cuerpo.data.id, 1);
    const n = await api.pedir('/peliculas/9999');
    assert.equal(n.status, 404);
    assert.equal(n.cuerpo.codigo, 'PELICULA_NO_ENCONTRADA');
    const m = await api.pedir('/peliculas/abc');
    assert.equal(m.status, 400);
  });

  it('crea con 201 y Location, rechaza duplicados y datos invalidos', async () => {
    const entorno = await levantarApi();
    try {
      const c = await entorno.crear(NUEVA);
      assert.equal(c.status, 201);
      assert.equal(c.cabeceras.get('location'), '/avanzado/ejercicio-12/peliculas/61');
      assert.equal(c.cuerpo.data.id, 61);
      const d = await entorno.crear(NUEVA);
      assert.equal(d.status, 409);
      assert.equal(d.cuerpo.codigo, 'PELICULA_DUPLICADA');
      const v = await entorno.crear({ ...NUEVA, titulo: '', calificacion: 11 });
      assert.equal(v.status, 400);
      assert.equal(v.cuerpo.errores.length, 2);
      const borrada = await entorno.pedir('/peliculas/61', { method: 'DELETE' });
      assert.equal(borrada.status, 200);
      const otra = await entorno.pedir('/peliculas/61', { method: 'DELETE' });
      assert.equal(otra.status, 404);
    } finally {
      await entorno.cerrar();
    }
  });

  it('exige json, rechaza json roto y cuerpos enormes', async () => {
    const tipo = await api.pedir('/peliculas', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
    assert.equal(tipo.status, 415);
    assert.equal(tipo.cuerpo.codigo, 'FORMATO_NO_SOPORTADO');
    const roto = await api.pedir('/peliculas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"a":' });
    assert.equal(roto.status, 400);
    assert.equal(roto.cuerpo.codigo, 'JSON_INVALIDO');
    const grande = await api.json('/peliculas', { ...NUEVA, sinopsis: 'x'.repeat(20000) });
    assert.equal(grande.status, 413);
    assert.equal(grande.cuerpo.codigo, 'PAYLOAD_GRANDE');
  });
});

describe('exportaciones guardadas', () => {
  it('crea una instantanea con hash y la descarga identica', async () => {
    const entorno = await levantarApi();
    try {
      const ok = await entorno.pedir('/exportaciones?forma=envoltorio&limite=5&campos=id,titulo&nombre=corte', { method: 'POST' });
      assert.equal(ok.status, 201);
      const vista = ok.cuerpo.data;
      assert.equal(vista.id, 1);
      assert.equal(vista.nombre, 'corte');
      assert.equal(vista.contenido, undefined);
      assert.equal(ok.cabeceras.get('location'), '/avanzado/ejercicio-12/exportaciones/1');
      const d = await entorno.crudo('/exportaciones/1/descargar');
      assert.equal(d.status, 200);
      const sha = createHash('sha256').update(d.cuerpo).digest();
      assert.equal(vista.sha256, sha.toString('hex'));
      assert.equal(d.cabeceras.etag, `"${sha.toString('hex')}"`);
      assert.equal(d.cabeceras.digest, `sha-256=${sha.toString('base64')}`);
      assert.match(d.cabeceras['cache-control'], /immutable/);
      assert.equal(JSON.parse(d.cuerpo.toString()).datos.length, 5);
      const n = await entorno.crudo('/exportaciones/1/descargar', { 'if-none-match': d.cabeceras.etag });
      assert.equal(n.status, 304);
    } finally {
      await entorno.cerrar();
    }
  });

  it('la instantanea no cambia aunque el catalogo cambie', async () => {
    const entorno = await levantarApi();
    try {
      await entorno.pedir('/exportaciones?campos=id', { method: 'POST' });
      await entorno.crear(NUEVA);
      const d = await entorno.crudo('/exportaciones/1/descargar');
      assert.equal(JSON.parse(d.cuerpo.toString()).length, 60);
      const viva = await entorno.crudo('/peliculas/exportar?campos=id', { 'accept-encoding': 'identity' });
      assert.equal(JSON.parse(viva.cuerpo.toString()).length, 61);
    } finally {
      await entorno.cerrar();
    }
  });

  it('lista, obtiene y elimina', async () => {
    const entorno = await levantarApi();
    try {
      await entorno.pedir('/exportaciones?limite=2', { method: 'POST' });
      await entorno.pedir('/exportaciones?limite=3', { method: 'POST' });
      const l = await entorno.pedir('/exportaciones');
      assert.equal(l.status, 200);
      assert.equal(l.cuerpo.data.length, 2);
      const o = await entorno.pedir('/exportaciones/2');
      assert.equal(o.cuerpo.data.registros, 3);
      const b = await entorno.pedir('/exportaciones/1', { method: 'DELETE' });
      assert.equal(b.status, 200);
      const n = await entorno.pedir('/exportaciones/1');
      assert.equal(n.status, 404);
      assert.equal(n.cuerpo.codigo, 'EXPORTACION_NO_ENCONTRADA');
      const d = await entorno.pedir('/exportaciones/1/descargar');
      assert.equal(d.status, 404);
    } finally {
      await entorno.cerrar();
    }
  });

  it('limita la cantidad de instantaneas', async () => {
    const entorno = await levantarApi();
    try {
      for (let i = 0; i < 20; i += 1) {
        const r = await entorno.pedir('/exportaciones?limite=1', { method: 'POST' });
        assert.equal(r.status, 201);
      }
      const extra = await entorno.pedir('/exportaciones?limite=1', { method: 'POST' });
      assert.equal(extra.status, 409);
      assert.equal(extra.cuerpo.codigo, 'EXPORTACION_LIMITE');
    } finally {
      await entorno.cerrar();
    }
  });

  it('rechaza una instantanea mayor al limite de bytes', async () => {
    const { sinteticas } = await import('../soporte/entorno.js');
    const entorno = await levantarApi({ peliculas: sinteticas(12000) });
    try {
      const r = await entorno.pedir('/exportaciones?limite=12000', { method: 'POST' });
      assert.equal(r.status, 413);
      assert.equal(r.cuerpo.codigo, 'EXPORTACION_DEMASIADO_GRANDE');
      const l = await entorno.pedir('/exportaciones');
      assert.equal(l.cuerpo.data.length, 0);
    } finally {
      await entorno.cerrar();
    }
  });

  it('valida los parametros de la instantanea', async () => {
    const r = await api.pedir('/exportaciones?forma=xml', { method: 'POST' });
    assert.equal(r.status, 400);
  });
});

describe('colecciones y rutas', () => {
  it('lista directores y actores paginados', async () => {
    const d = await api.pedir('/directores');
    assert.equal(d.cuerpo.paginacion.total, 8);
    const a = await api.pedir('/actores?limite=10');
    assert.equal(a.cuerpo.data.length, 10);
    assert.equal(a.cuerpo.paginacion.total, 24);
  });

  it('la raiz informa el tema', async () => {
    const r = await api.pedir('');
    assert.equal(r.cuerpo.topic, 'exportacion JSON');
  });

  it('405 con Allow, OPTIONS 204 y 404 para rutas desconocidas', async () => {
    const m = await api.pedir('/peliculas/exportar', { method: 'POST' });
    assert.equal(m.status, 405);
    assert.equal(m.cabeceras.get('allow'), 'GET');
    const o = await api.pedir('/peliculas', { method: 'OPTIONS' });
    assert.equal(o.status, 204);
    const n = await api.pedir('/nada');
    assert.equal(n.status, 404);
    assert.equal(n.cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
  });

  it('si falla la serializacion a mitad de la respuesta se corta la conexion y se registra', async () => {
    const registrados = [];
    const entorno = await levantarApi({
      alSerializar: () => { throw new Error('falla interna secreta'); },
      registro: (e) => registrados.push(e),
    });
    try {
      await assert.rejects(entorno.pedir('/peliculas/exportar?limite=1&compresion=ninguna'));
      assert.equal(registrados.length, 1);
      assert.equal(registrados[0].nivel, 'error');
      assert.match(registrados[0].mensaje, /secreta/);
    } finally {
      await entorno.cerrar();
    }
  });
});
