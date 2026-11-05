import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { trozosJson } from '../src/domain/serializador.js';

const filasDe = (datos) => datos.map((d) => () => d);
const unir = (opciones) => [...trozosJson(opciones)].join('');
const datosDe = (n) => Array.from({ length: n }, (_, i) => ({
  id: i + 1, titulo: `T${i}`, anidado: { a: [1, 2, { b: null }], vacio: [] }, etiquetas: [],
}));
const META = { total: 3, filtros: {}, campos: ['id', 'titulo'], anidado: { x: [1, 2] } };

describe('serializador', () => {
  for (const n of [0, 1, 2, 99, 100, 101, 250]) {
    it(`el arreglo compacto con ${n} filas es igual a JSON.stringify`, () => {
      const datos = datosDe(n);
      assert.equal(unir({ forma: 'arreglo', pretty: false, meta: META, filas: filasDe(datos) }), JSON.stringify(datos));
    });

    it(`el arreglo con sangria con ${n} filas es igual a JSON.stringify(..., null, 2)`, () => {
      const datos = datosDe(n);
      assert.equal(unir({ forma: 'arreglo', pretty: true, meta: META, filas: filasDe(datos) }), JSON.stringify(datos, null, 2));
    });

    it(`el envoltorio compacto con ${n} filas es igual a JSON.stringify`, () => {
      const datos = datosDe(n);
      assert.equal(unir({ forma: 'envoltorio', pretty: false, meta: META, filas: filasDe(datos) }), JSON.stringify({ meta: META, datos }));
    });

    it(`el envoltorio con sangria con ${n} filas es igual a JSON.stringify(..., null, 2)`, () => {
      const datos = datosDe(n);
      assert.equal(unir({ forma: 'envoltorio', pretty: true, meta: META, filas: filasDe(datos) }), JSON.stringify({ meta: META, datos }, null, 2));
    });
  }

  it('ndjson escribe un objeto por linea y termina con salto', () => {
    const datos = datosDe(3);
    const texto = unir({ forma: 'ndjson', pretty: false, meta: META, filas: filasDe(datos) });
    assert.ok(texto.endsWith('\n'));
    assert.deepEqual(texto.trim().split('\n').map((l) => JSON.parse(l)), datos);
    assert.equal(unir({ forma: 'ndjson', pretty: false, meta: META, filas: filasDe([]) }), '');
  });

  it('el resultado siempre es json valido con comillas, saltos, emojis y separadores raros', () => {
    const datos = [
      { t: 'dice "hola"\n\\ y \t tab' },
      { t: 'linea\u2028separada\u2029' },
      { t: 'sustos \ud83d\udc7b' },
      { t: 'suelto \uD800 roto' },
    ];
    for (const forma of ['arreglo', 'envoltorio']) {
      for (const pretty of [true, false]) {
        const texto = unir({ forma, pretty, meta: META, filas: filasDe(datos) });
        const leido = JSON.parse(texto);
        assert.deepEqual(forma === 'arreglo' ? leido : leido.datos, JSON.parse(JSON.stringify(datos)));
      }
    }
  });

  it('las filas se calculan una por una, a medida que se piden los trozos', () => {
    let calculadas = 0;
    const filas = Array.from({ length: 250 }, () => () => { calculadas += 1; return { x: 1 }; });
    const iterador = trozosJson({ forma: 'arreglo', pretty: false, meta: META, filas });
    iterador.next();
    assert.equal(calculadas, 0);
    iterador.next();
    assert.equal(calculadas, 100);
    iterador.next();
    assert.equal(calculadas, 200);
  });
});
