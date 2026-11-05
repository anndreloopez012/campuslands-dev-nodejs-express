import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  esIsrc, leerIsrcDeRuta, leerListadoCanciones, leerOpcionesImportacion, normalizarIsrc, validarCancion,
} from '../src/validators/cancion.js';
import { cancion, rechazaCon } from '../soporte/entorno.js';

const validar = (cambios) => validarCancion({ ...cancion(1), ...cambios }, { anioMaximo: 2026 });
const campos = (r) => r.errores.map((e) => e.campo);

describe('ISRC', () => {
  it('normaliza guiones, espacios y minusculas', () => {
    assert.equal(normalizarIsrc('us-abc-24-00001'), 'USABC2400001');
    assert.equal(normalizarIsrc(' qz abc 24 00001 '), 'QZABC2400001');
    assert.equal(normalizarIsrc(5), 5);
  });

  it('reconoce el formato de 12 caracteres', () => {
    assert.equal(esIsrc('QZABC2400001'), true);
    assert.equal(esIsrc('QZ1B32400001'), true);
    for (const malo of ['QZABC240000', 'QZABC24000012', '1ZABC2400001', 'QZABC24A0001', '', null]) assert.equal(esIsrc(malo), false, String(malo));
  });

  it('leerIsrcDeRuta acepta variantes y rechaza lo demas', () => {
    assert.equal(leerIsrcDeRuta('qz-abc-24-00001'), 'QZABC2400001');
    assert.throws(() => leerIsrcDeRuta('nada'), rechazaCon('VALIDACION'));
  });
});

describe('validarCancion', () => {
  it('acepta una cancion correcta y normaliza el isrc, el genero y los textos', () => {
    const r = validar({ isrc: 'qz-abc-24-00001', genero: ' ROCK ', titulo: '  Hola  ' });
    assert.equal(r.errores, undefined);
    assert.equal(r.valor.isrc, 'QZABC2400001');
    assert.equal(r.valor.genero, 'rock');
    assert.equal(r.valor.titulo, 'Hola');
  });

  it('album es opcional y explicito vale falso por defecto', () => {
    const r = validar({ album: undefined, explicito: undefined });
    assert.equal(r.valor.album, null);
    assert.equal(r.valor.explicito, false);
    assert.equal(validar({ album: null }).valor.album, null);
  });

  it('exige un objeto y rechaza campos desconocidos', () => {
    assert.deepEqual(campos(validarCancion('texto', { anioMaximo: 2026 })), ['fila']);
    assert.deepEqual(campos(validarCancion([], { anioMaximo: 2026 })), ['fila']);
    assert.deepEqual(campos(validar({ cantante: 'x' })), ['cantante']);
  });

  it('valida cada campo', () => {
    assert.deepEqual(campos(validar({ isrc: undefined })), ['isrc']);
    assert.deepEqual(campos(validar({ isrc: 'corto' })), ['isrc']);
    assert.deepEqual(campos(validar({ titulo: '' })), ['titulo']);
    assert.deepEqual(campos(validar({ titulo: 'x'.repeat(121) })), ['titulo']);
    assert.deepEqual(campos(validar({ artista: undefined })), ['artista']);
    assert.deepEqual(campos(validar({ album: 5 })), ['album']);
    assert.deepEqual(campos(validar({ anio: 1899 })), ['anio']);
    assert.deepEqual(campos(validar({ anio: 2027 })), ['anio']);
    assert.deepEqual(campos(validar({ anio: '2020' })), ['anio']);
    assert.deepEqual(campos(validar({ duracionSeg: 5 })), ['duracionSeg']);
    assert.deepEqual(campos(validar({ duracionSeg: 3601 })), ['duracionSeg']);
    assert.deepEqual(campos(validar({ genero: 'ranchera' })), ['genero']);
    assert.deepEqual(campos(validar({ genero: undefined })), ['genero']);
    assert.deepEqual(campos(validar({ explicito: 'si' })), ['explicito']);
  });

  it('reporta todos los errores de la fila a la vez', () => {
    const r = validar({ isrc: 'x', titulo: '', anio: 1, genero: 'z' });
    assert.deepEqual(campos(r).sort(), ['anio', 'genero', 'isrc', 'titulo']);
  });
});

describe('opciones de la consulta', () => {
  it('usa valores por defecto', () => {
    const r = leerOpcionesImportacion({}, {});
    assert.deepEqual(r.opciones, {
      modo: 'permisivo', conflicto: 'omitir', tamanoLote: 100, dryRun: false,
    });
    assert.equal(r.esperar, false);
    assert.equal(r.clave, null);
  });

  it('lee modo, conflicto, lote, dryRun, esperar y la clave de idempotencia', () => {
    const r = leerOpcionesImportacion(
      {
        modo: 'todo-o-nada', conflicto: 'actualizar', tamanoLote: '25', dryRun: 'true', esperar: 'true',
      },
      { 'idempotency-key': 'carga:1' },
    );
    assert.equal(r.opciones.modo, 'todo-o-nada');
    assert.equal(r.opciones.tamanoLote, 25);
    assert.equal(r.opciones.dryRun, true);
    assert.equal(r.clave, 'carga:1');
  });

  it('acumula los errores', () => {
    assert.throws(
      () => leerOpcionesImportacion({
        modo: 'x', conflicto: 'y', tamanoLote: '0', dryRun: 'quizas', esperar: '1', otro: '1',
      }, { 'idempotency-key': 'con espacios' }),
      (e) => rechazaCon('VALIDACION')(e) && e.detalles.length === 7,
    );
    assert.throws(() => leerOpcionesImportacion({ tamanoLote: '501' }, {}), rechazaCon('VALIDACION'));
  });

  it('valida el listado de canciones', () => {
    assert.equal(leerListadoCanciones({ anio: '2020', genero: 'rock' }).filtros.anio, 2020);
    assert.throws(() => leerListadoCanciones({ anio: '20', genero: 'x', limite: '0', raro: '1' }), (e) => e.detalles.length === 4);
  });
});
