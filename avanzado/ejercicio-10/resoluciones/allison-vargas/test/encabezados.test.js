import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analizarEncabezados, exigirEncabezados } from '../src/domain/encabezados.js';
import {
  claveDeEncabezado, decodificar, leerCharset, normalizarClave,
} from '../src/domain/texto.js';
import { rechazaCon } from '../soporte/entorno.js';

describe('texto', () => {
  it('normalizarClave quita acentos, mayusculas y espacios repetidos', () => {
    assert.equal(normalizarClave('  Jos\u00E9   Mu\u00F1oz '), 'jose munoz');
    assert.equal(claveDeEncabezado('Sets_Local'), 'setslocal');
    assert.equal(claveDeEncabezado('Sets Local'), 'setslocal');
  });

  it('leerCharset toma el charset del content-type o usa utf-8', () => {
    assert.equal(leerCharset('text/csv'), 'utf-8');
    assert.equal(leerCharset('text/csv; charset=ISO-8859-1'), 'iso-8859-1');
    assert.equal(leerCharset('text/csv; charset="UTF-8"'), 'utf-8');
    assert.equal(leerCharset(undefined), 'utf-8');
  });

  it('decodifica utf-8 y avisa si traia BOM', () => {
    const conBom = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('a,b')]);
    assert.deepEqual(decodificar(conBom), { texto: 'a,b', bom: true, codificacion: 'utf-8' });
    assert.equal(decodificar(Buffer.from('a,b')).bom, false);
  });

  it('decodifica latin1 cuando se indica', () => {
    const bytes = Buffer.from([0x4a, 0x6f, 0x73, 0xe9]);
    assert.equal(decodificar(bytes, 'iso-8859-1').texto, 'Jos\u00E9');
    assert.equal(decodificar(bytes, 'latin1').texto, 'Jos\u00E9');
  });

  it('rechaza bytes que no son utf-8 valido y charsets desconocidos', () => {
    assert.throws(() => decodificar(Buffer.from([0x4a, 0xe9])), rechazaCon('CODIFICACION_INVALIDA', { charset: 'utf-8' }));
    assert.throws(() => decodificar(Buffer.from('a'), 'shift_jis'), rechazaCon('CODIFICACION_INVALIDA', { charset: 'shift_jis' }));
  });
});

describe('encabezados', () => {
  it('reconoce alias, mayusculas y separadores', () => {
    const r = analizarEncabezados(['Fecha', 'Jugador Local', 'VISITANTE', 'Sets_Local', 'sets visitante', 'Formato']);
    assert.deepEqual([...r.indices.keys()], ['fecha', 'local', 'visita', 'setsLocal', 'setsVisita', 'mejorDe']);
    assert.deepEqual(r.faltantes, []);
  });

  it('lista las columnas desconocidas y no cuenta las vacias', () => {
    const r = analizarEncabezados(['fecha', 'local', 'visita', 'setsLocal', 'setsVisita', 'arbitro', '']);
    assert.deepEqual(r.ignoradas, ['arbitro']);
  });

  it('detecta faltantes, duplicadas y puntos incompletos', () => {
    const r = analizarEncabezados(['fecha', 'local', 'jugador1', 'puntosLocal']);
    assert.deepEqual(r.faltantes, ['visita', 'setsLocal', 'setsVisita']);
    assert.deepEqual(r.duplicadas, ['local']);
    assert.equal(r.conPuntos, true);
  });

  it('exigirEncabezados lanza el error con un detalle por problema', () => {
    assert.throws(
      () => exigirEncabezados(['fecha', 'local']),
      (error) => rechazaCon('ENCABEZADOS_INVALIDOS')(error) && error.detalles.length === 3,
    );
    assert.ok(exigirEncabezados(['fecha', 'local', 'visita', 'setsLocal', 'setsVisita']).indices.size === 5);
  });
});
