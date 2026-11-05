import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { escaparRegExp, limpiarTexto, sinAcentos } from '../src/sanitizacion/texto.js';
import { LIMITES, revisarEstructura } from '../src/sanitizacion/estructura.js';
import { escaparHtml, resaltar } from '../src/vistas/escape.js';

describe('limpiarTexto', () => {
  it('normaliza a NFC para que la misma letra se guarde igual', () => {
    const descompuesta = 'Cafe\u0301';
    const { texto, cambios } = limpiarTexto(descompuesta);
    assert.equal(texto, 'Caf\u00E9');
    assert.equal(texto.length, 4);
    assert.deepEqual(cambios, ['normalizado a NFC']);
  });

  it('quita caracteres invisibles, de direccion y de control', () => {
    const { texto, cambios } = limpiarTexto('Air\u200BMax \u202Egpj.exe\u0007\uFEFF');
    assert.equal(texto, 'AirMax gpj.exe');
    assert.deepEqual(cambios, ['se quitaron caracteres invisibles', 'se quitaron caracteres de control']);
  });

  it('ordena espacios en una linea o conserva parrafos en multilinea', () => {
    assert.equal(limpiarTexto('  hola \t  mundo \n otra ').texto, 'hola mundo otra');
    const { texto } = limpiarTexto('  linea  uno \r\n\r\n\r\n\r\n  linea   dos\t', { multilinea: true });
    assert.equal(texto, 'linea uno\n\nlinea dos');
    assert.deepEqual(limpiarTexto('limpio').cambios, []);
  });

  it('puede quitar etiquetas html sin tocar signos sueltos', () => {
    const { texto, cambios } = limpiarTexto('Suela <b>dura</b><script>alert(1)</script> 3 < 5 <!-- x -->', { quitarHtml: true });
    assert.equal(texto, 'Suela duraalert(1) 3 < 5');
    assert.ok(cambios.includes('se quitaron etiquetas html'));
  });

  it('compara sin acentos y escapa expresiones regulares', () => {
    assert.equal(sinAcentos('Poler\u00D3n \u00D1and\u00FA'), 'poleron nandu');
    assert.equal(escaparRegExp('a.b*(c)?[d]'), 'a\\.b\\*\\(c\\)\\?\\[d\\]');
    assert.doesNotThrow(() => new RegExp(escaparRegExp('(((')));
  });
});

describe('revisarEstructura', () => {
  it('acepta objetos normales', () => {
    assert.deepEqual(revisarEstructura({ nombre: 'x', tallas: [40, 41], datos: { a: 1 } }), []);
    assert.deepEqual(revisarEstructura('texto'), []);
  });

  it('detecta contaminacion de prototipo y operadores de consulta', () => {
    const malo = JSON.parse('{"__proto__":{"admin":true},"a":{"constructor":{"prototype":{}}},"precio":{"$gt":0},"x.y":1}');
    assert.deepEqual(revisarEstructura(malo).map((p) => p.campo), ['__proto__', 'a.constructor', 'precio.$gt', 'x.y']);
    assert.equal({}.admin, undefined);
  });

  it('limita profundidad, cantidad de claves, largo de listas y de textos', () => {
    const profundo = { a: { b: { c: { d: { e: { f: 1 } } } } } };
    assert.match(revisarEstructura(profundo)[0].mensaje, /anidacion/);
    const ancho = Object.fromEntries(Array.from({ length: LIMITES.clavesPorObjeto + 1 }, (_, i) => [`k${i}`, i]));
    assert.match(revisarEstructura(ancho)[0].mensaje, /claves/);
    assert.match(revisarEstructura({ l: Array(51).fill(1) })[0].mensaje, /lista/);
    assert.match(revisarEstructura({ t: 'x'.repeat(5001) })[0].mensaje, /texto/);
    assert.match(revisarEstructura({ 'con espacio': 1 })[0].mensaje, /clave no permitido/);
  });
});

describe('escape en la salida', () => {
  it('escapa antes de resaltar para que solo <mark> sea html real', () => {
    assert.equal(escaparHtml('<a href="x">'), '&lt;a href=&quot;x&quot;&gt;');
    assert.equal(resaltar('Gorro <Trucker>', 'trucker'), 'Gorro &lt;<mark>Trucker</mark>&gt;');
    assert.equal(resaltar('precio (oferta)', '(oferta'), 'precio <mark>(oferta</mark>)');
    assert.equal(resaltar('a < b', '<'), 'a <mark>&lt;</mark> b');
    assert.equal(resaltar('sin termino'), 'sin termino');
  });
});
