import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LectorCsv, detectarDelimitador, escaparCelda, escribirCsv, neutralizar, parsearCsv,
} from '../src/domain/csv.js';
import { rechazaCon } from '../soporte/entorno.js';

const campos = (texto, opciones) => parsearCsv(texto, opciones).map((r) => r.campos);

describe('LectorCsv', () => {
  it('separa filas y columnas simples', () => {
    assert.deepEqual(campos('a,b,c\n1,2,3\n'), [['a', 'b', 'c'], ['1', '2', '3']]);
  });

  it('acepta la ultima fila sin salto de linea', () => {
    assert.deepEqual(campos('a,b\n1,2'), [['a', 'b'], ['1', '2']]);
  });

  it('entiende \\n, \\r\\n y \\r como fin de fila', () => {
    assert.deepEqual(campos('a\r\nb\rc\nd'), [['a'], ['b'], ['c'], ['d']]);
  });

  it('respeta comas, comillas dobles y saltos dentro de campos entre comillas', () => {
    const filas = campos('a,"x, y","dice ""hola""","uno\ndos"\n');
    assert.deepEqual(filas, [['a', 'x, y', 'dice "hola"', 'uno\ndos']]);
  });

  it('conserva campos vacios y el espacio de los extremos', () => {
    assert.deepEqual(campos('a,,c,\n, x ,"",\n'), [['a', '', 'c', ''], ['', ' x ', '', '']]);
  });

  it('salta lineas vacias pero cuenta bien los numeros de linea', () => {
    const filas = parsearCsv('a\n\n\nb\n"x\ny"\nc\n');
    assert.deepEqual(filas.map((f) => f.linea), [1, 4, 5, 7]);
  });

  it('usa el delimitador indicado', () => {
    assert.deepEqual(campos('a;b,c\n1;2,3', { delimitador: ';' }), [['a', 'b,c'], ['1', '2,3']]);
    assert.deepEqual(campos('a\tb\n', { delimitador: '\t' }), [['a', 'b']]);
  });

  it('da el mismo resultado sin importar donde se corte el texto', () => {
    const texto = 'id,nota\r\n1,"linea 1\r\nlinea ""2"""\r\n2,\u00F1and\u00FA\n3,fin';
    const esperado = campos(texto);
    for (let corte = 0; corte <= texto.length; corte += 1) {
      const lector = new LectorCsv();
      const filas = [...lector.escribir(texto.slice(0, corte)), ...lector.escribir(texto.slice(corte)), ...lector.terminar()];
      assert.deepEqual(filas.map((f) => f.campos), esperado, `corte en ${corte}`);
    }
  });

  it('un \\r\\n partido entre dos trozos cuenta como un solo salto', () => {
    const lector = new LectorCsv();
    const filas = [...lector.escribir('a\r'), ...lector.escribir('\nb\n'), ...lector.terminar()];
    assert.deepEqual(filas.map((f) => f.campos), [['a'], ['b']]);
  });

  it('falla con comillas sin cerrar y dice en que linea empezo el registro', () => {
    assert.throws(() => parsearCsv('a\nb,"abierta\nsigue\n'), rechazaCon('CSV_MAL_FORMADO', { linea: 2 }));
  });

  it('falla con comillas en medio de un campo sin comillas', () => {
    assert.throws(() => parsearCsv('a\nx"y\n'), rechazaCon('CSV_MAL_FORMADO', { linea: 2 }));
  });

  it('falla con texto pegado despues de cerrar comillas', () => {
    assert.throws(() => parsearCsv('"a"b,c\n'), rechazaCon('CSV_MAL_FORMADO', { linea: 1 }));
  });

  it('falla con un campo demasiado largo', () => {
    assert.throws(() => parsearCsv(`${'x'.repeat(30)}\n`, { maxCampo: 10 }), rechazaCon('CSV_MAL_FORMADO'));
    assert.throws(() => parsearCsv(`"${'x'.repeat(30)}"\n`, { maxCampo: 10 }), rechazaCon('CSV_MAL_FORMADO'));
  });

  it('falla al pasar el maximo de registros', () => {
    assert.throws(() => parsearCsv('a\nb\nc\nd\n', { maxRegistros: 3 }), rechazaCon('LIMITE_DE_FILAS', { maximo: 2 }));
    assert.equal(parsearCsv('a\nb\nc\n', { maxRegistros: 3 }).length, 3);
  });
});

describe('detectarDelimitador', () => {
  it('reconoce coma, punto y coma, tabulador y barra', () => {
    assert.equal(detectarDelimitador('a,b,c\n1,2,3\n'), ',');
    assert.equal(detectarDelimitador('a;b;c\n1;2;3\n'), ';');
    assert.equal(detectarDelimitador('a\tb\tc\n1\t2\t3\n'), '\t');
    assert.equal(detectarDelimitador('a|b|c\n1|2|3\n'), '|');
  });

  it('prefiere el que da una cantidad de columnas constante', () => {
    assert.equal(detectarDelimitador('nombre;nota\n"Paz, Ana";10\n"Gil, Luis";9\n'), ';');
  });

  it('ignora delimitadores que solo aparecen dentro de comillas', () => {
    assert.equal(detectarDelimitador('a,b\n"x;y;z",2\n'), ',');
  });

  it('tolera algunas filas con otra cantidad de columnas', () => {
    assert.equal(detectarDelimitador('a;b;c\n1;2;3\n4;5\n6;7;8\n'), ';');
  });

  it('usa coma cuando no hay pistas', () => {
    assert.equal(detectarDelimitador('solo\nuna\ncolumna\n'), ',');
    assert.equal(detectarDelimitador(''), ',');
    assert.equal(detectarDelimitador('a;b\n1;2;3\n'), ',');
  });
});

describe('escritura', () => {
  it('neutraliza celdas que un programa de hojas de calculo ejecutaria como formula', () => {
    assert.equal(neutralizar('=SUMA(A1)'), "'=SUMA(A1)");
    assert.equal(neutralizar('+1'), "'+1");
    assert.equal(neutralizar('-cmd'), "'-cmd");
    assert.equal(neutralizar('@x'), "'@x");
    assert.equal(neutralizar('normal'), 'normal');
    assert.equal(neutralizar(-5), -5);
  });

  it('escaparCelda pone comillas solo cuando hace falta', () => {
    assert.equal(escaparCelda('simple'), 'simple');
    assert.equal(escaparCelda('a,b'), '"a,b"');
    assert.equal(escaparCelda('a;b', ';'), '"a;b"');
    assert.equal(escaparCelda('dice "hola"'), '"dice ""hola"""');
    assert.equal(escaparCelda('dos\nlineas'), '"dos\nlineas"');
    assert.equal(escaparCelda(' con espacios '), '" con espacios "');
    assert.equal(escaparCelda(null), '');
    assert.equal(escaparCelda(0), '0');
  });

  it('escribirCsv usa CRLF, agrega BOM si se pide y puede volver a leerse igual', () => {
    const filas = [
      { a: 'uno', b: 'x, y', c: 'dice "z"' },
      { a: 'linea\nnueva', b: '', c: null },
    ];
    const texto = escribirCsv(['a', 'b', 'c'], filas);
    assert.ok(texto.endsWith('\r\n'));
    assert.deepEqual(campos(texto), [['a', 'b', 'c'], ['uno', 'x, y', 'dice "z"'], ['linea\nnueva', '', '']]);
    assert.ok(escribirCsv(['a'], [], { bom: true }).startsWith('\uFEFF'));
    assert.deepEqual(campos(escribirCsv(['a', 'b'], [{ a: 'p;q', b: 1 }], { delimitador: ';' }), { delimitador: ';' }), [['a', 'b'], ['p;q', '1']]);
  });
});
