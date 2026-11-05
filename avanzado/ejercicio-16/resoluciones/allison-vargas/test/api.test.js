import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { levantar } from '../soporte/cliente.js';

let api;
before(async () => { api = await levantar(crearApp({ registro: () => {} })); });
after(async () => { await api.cerrar(); });

const NUEVO = {
  sku: 'snk  run_77',
  nombre: '  Runner\u200B   Noche\u0301 ',
  marca: 'Aerostep',
  categoria: 'sneakers',
  precio: 79990,
  tallas: ['42', 40, '41,5', 40],
  colores: ['Negro', ' negro ', 'Azul'],
  descripcion: '<p>Ideal para <b>salir</b> de noche.</p>\r\n\r\n\r\nReflectante.',
};

const crudo = (ruta, body, metodo = 'POST') => api.pedir(ruta, { method: metodo, headers: { 'content-type': 'application/json' }, body });

describe('crear con entrada sucia', () => {
  it('limpia, normaliza y explica cada cambio', async () => {
    const r = await api.json('/productos', NUEVO);
    assert.equal(r.status, 201);
    const p = r.cuerpo.data;
    assert.equal(p.sku, 'SNK-RUN-77');
    assert.equal(p.nombre, 'Runner Noch\u00E9');
    assert.deepEqual(p.tallas, [40, 41.5, 42]);
    assert.deepEqual(p.colores, ['negro', 'azul']);
    assert.equal(p.descripcion, 'Ideal para salir de noche.\n\nReflectante.');
    const campos = r.cuerpo.cambios.map((c) => `${c.campo}: ${c.cambio}`);
    assert.ok(campos.includes('sku: normalizado a mayusculas y guiones'));
    assert.ok(campos.includes('nombre: se quitaron caracteres invisibles'));
    assert.ok(campos.includes('nombre: normalizado a NFC'));
    assert.ok(campos.includes('descripcion: se quitaron etiquetas html'));
    assert.ok(campos.includes('tallas: normalizadas, sin repetidos y ordenadas'));
    const duplicado = await api.json('/productos', { ...NUEVO, sku: 'SNK-RUN-77 ' });
    assert.equal(duplicado.status, 409);
    assert.equal(duplicado.cuerpo.codigo, 'SKU_DUPLICADO');
  });

  it('rechaza tipos incorrectos en lugar de adivinarlos', async () => {
    const r = await api.json('/productos', {
      ...NUEVO, sku: 'X', precio: '1e5', nombre: '<script>alert(1)</script>', tallas: [33, 'XL', 40.3], colores: 'rojo',
    });
    assert.equal(r.status, 400);
    assert.deepEqual(r.cuerpo.errores.map((e) => e.campo), ['sku', 'nombre', 'precio', 'tallas[0]', 'tallas[1]', 'tallas[2]', 'colores']);
    const ropa = await api.json('/productos', {
      ...NUEVO, sku: 'POL-NEW-1', categoria: 'poleras', tallas: [' m ', 'xs', 'M', 'XXXL'],
    });
    assert.deepEqual(ropa.cuerpo.errores, [{ campo: 'tallas[3]', mensaje: 'debe ser una de: XS, S, M, L, XL, XXL' }]);
  });
});

describe('estructuras peligrosas', () => {
  it('bloquea __proto__, constructor y operadores $ sin contaminar Object.prototype', async () => {
    const r = await crudo('/productos', '{"sku":"AAA-111","__proto__":{"esAdmin":true}}');
    assert.equal(r.status, 400);
    assert.equal(r.cuerpo.codigo, 'ENTRADA_PELIGROSA');
    assert.equal(r.cuerpo.errores[0].campo, '__proto__');
    assert.equal({}.esAdmin, undefined);
    const op = await api.json('/productos/1', { precio: { $gt: 0 } }, 'PATCH');
    assert.equal(op.cuerpo.errores[0].campo, 'precio.$gt');
    const c = await api.json('/productos', { constructor: { prototype: { x: 1 } } });
    assert.equal(c.cuerpo.codigo, 'ENTRADA_PELIGROSA');
  });

  it('solo acepta objetos JSON y limita tamano', async () => {
    assert.equal((await crudo('/productos', '"solo texto"')).cuerpo.codigo, 'JSON_INVALIDO');
    assert.equal((await crudo('/productos', `{"descripcion":"${'x'.repeat(17000)}"}`)).status, 413);
    assert.equal((await api.pedir('/productos', { method: 'POST', body: '{}' })).status, 415);
  });
});

describe('busqueda', () => {
  it('busca sin importar acentos ni mayusculas y filtra por varias tallas', async () => {
    const r = await api.pedir('/productos?q=POLER%C3%93N&orden=-precio');
    assert.deepEqual(r.cuerpo.data.map((p) => p.id), [7, 6]);
    const t = await api.pedir('/productos?categoria=sneakers&talla=36&talla=45&limite=50');
    assert.deepEqual(t.cuerpo.data.map((p) => p.id).sort(), [2, 3]);
    const precio = await api.pedir('/productos?precioMax=15000');
    assert.deepEqual(precio.cuerpo.data.map((p) => p.id).sort(), [5, 8]);
  });

  it('rechaza parametros repetidos, anidados y valores ambiguos', async () => {
    const repetido = await api.pedir('/productos?q=gorro&q=polera');
    assert.equal(repetido.status, 400);
    assert.equal(repetido.cuerpo.errores[0].mensaje, 'parametro repetido');
    const anidado = await api.pedir('/productos?precioMax[$gt]=0');
    assert.equal(anidado.cuerpo.errores[0].campo, 'precioMax[$gt]');
    const ambiguo = await api.pedir('/productos?precioMax=1e5&orden=__proto__&talla=99999');
    assert.deepEqual(ambiguo.cuerpo.errores.map((e) => e.campo).sort(), ['orden', 'precioMax', 'talla']);
    const corto = await api.pedir('/productos?q=%E2%80%8Ba');
    assert.equal(corto.status, 400);
  });
});

describe('actualizar, ficha y previsualizar', () => {
  it('actualiza parcialmente y exige tallas al cambiar de categoria', async () => {
    const ok = await api.json('/productos/8', { nombre: 'Gorro   Trucker Pro' }, 'PATCH');
    assert.equal(ok.cuerpo.data.nombre, 'Gorro Trucker Pro');
    const cat = await api.json('/productos/8', { categoria: 'sneakers' }, 'PATCH');
    assert.equal(cat.cuerpo.errores[0].campo, 'tallas');
    const vacio = await api.json('/productos/8', {}, 'PATCH');
    assert.equal(vacio.status, 400);
    const borrar = await api.pedir('/productos/9', { method: 'DELETE' });
    assert.equal(borrar.status, 200);
    assert.equal((await api.pedir('/productos/9')).cuerpo.codigo, 'PRODUCTO_NO_ENCONTRADO');
  });

  it('la ficha html escapa todo y resalta terminos con caracteres especiales', async () => {
    await api.json('/productos/5', { descripcion: 'Talla (unica) & comoda' }, 'PATCH');
    const r = await api.pedir('/productos/5/ficha?resaltar=(unica)');
    assert.equal(r.status, 200);
    assert.equal(r.cabeceras.get('content-security-policy'), "default-src 'none'; style-src 'self'");
    assert.ok(r.cuerpo.includes('<p>Talla <mark>(unica)</mark> &amp; comoda</p>'));
    const malicioso = await api.pedir('/productos/5/ficha?resaltar=%3Cimg%20src%3Dx%3E');
    assert.equal(malicioso.cuerpo.includes('<img'), false);
    assert.equal((await api.pedir('/productos/5/ficha?resaltar=a')).status, 400);
  });

  it('previsualiza la limpieza de un texto', async () => {
    const r = await api.json('/sanitizar', { texto: 'Hola\u200B <i>mundo</i>\u0000', quitarHtml: true });
    assert.deepEqual(r.cuerpo.data, {
      original: 'Hola\u200B <i>mundo</i>\u0000',
      limpio: 'Hola mundo',
      cambios: ['se quitaron caracteres invisibles', 'se quitaron caracteres de control', 'se quitaron etiquetas html'],
      largoOriginal: 19,
      largoLimpio: 10,
    });
    assert.equal((await api.json('/sanitizar', { texto: 1, multilinea: 'si' })).cuerpo.errores.length, 2);
    assert.equal((await api.pedir('/')).cuerpo.topic, 'sanitizacion de entrada');
  });
});
