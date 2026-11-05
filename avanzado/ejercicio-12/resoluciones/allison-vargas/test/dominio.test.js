import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Catalogo } from '../src/domain/catalogo.js';
import { coincideEtag, esFresco, hash } from '../src/domain/http.js';
import { camposPorDefecto, esquemaDe, proyectar } from '../src/domain/proyeccion.js';
import { leerEsquema, leerExportacion, leerListado, validarPelicula } from '../src/validators/pelicula.js';
import { loadJson } from '../src/utils/loadJson.js';
import { NUEVA, crearReloj, rechazaCon } from '../soporte/entorno.js';

const datos = () => ({
  peliculas: loadJson('peliculas.json'), directores: loadJson('directores.json'), actores: loadJson('actores.json'),
});
const crearCatalogo = () => {
  const tiempo = crearReloj();
  return { catalogo: new Catalogo({ ...datos(), reloj: tiempo.reloj }), ...tiempo };
};

describe('http', () => {
  it('coincideEtag ignora el prefijo W/, acepta listas y comodin', () => {
    assert.equal(coincideEtag('W/"a"', '"a"'), true);
    assert.equal(coincideEtag('"x", W/"a"', 'W/"a"'), true);
    assert.equal(coincideEtag('*', '"a"'), true);
    assert.equal(coincideEtag('"b"', '"a"'), false);
    assert.equal(coincideEtag(undefined, '"a"'), false);
  });

  it('esFresco usa If-None-Match y solo si no esta usa If-Modified-Since', () => {
    const modificadoEn = new Date('2026-11-05T12:00:00.500Z');
    const pedido = (headers) => ({ headers });
    assert.equal(esFresco(pedido({ 'if-none-match': 'W/"a"' }), { etag: 'W/"a"', modificadoEn }), true);
    assert.equal(esFresco(pedido({ 'if-none-match': 'W/"b"', 'if-modified-since': 'Fri, 01 Jan 2100 00:00:00 GMT' }), { etag: 'W/"a"', modificadoEn }), false);
    assert.equal(esFresco(pedido({ 'if-modified-since': modificadoEn.toUTCString() }), { etag: 'x', modificadoEn }), true);
    assert.equal(esFresco(pedido({ 'if-modified-since': 'Thu, 05 Nov 2026 11:59:59 GMT' }), { etag: 'x', modificadoEn }), false);
    assert.equal(esFresco(pedido({ 'if-modified-since': 'basura' }), { etag: 'x', modificadoEn }), false);
    assert.equal(esFresco(pedido({}), { etag: 'x', modificadoEn }), false);
  });

  it('hash es estable y corto', () => {
    assert.equal(hash('a'), hash('a'));
    assert.notEqual(hash('a'), hash('b'));
    assert.equal(hash('a').length, 16);
  });
});

describe('proyeccion', () => {
  const { catalogo } = crearCatalogo();
  const pelicula = catalogo.pelicula(1);

  it('respeta el orden de los campos pedidos', () => {
    assert.deepEqual(Object.keys(proyectar(pelicula, ['titulo', 'id'], [], catalogo)), ['titulo', 'id']);
  });

  it('agrega director, reparto y ganancia cuando se incluyen', () => {
    const r = proyectar(pelicula, ['id', 'director', 'reparto', 'ganancia'], ['director', 'reparto', 'ganancia'], catalogo);
    assert.deepEqual(Object.keys(r.director), ['id', 'nombre', 'pais']);
    assert.equal(r.reparto.length, pelicula.repartoIds.length);
    assert.equal(r.ganancia, Math.round((pelicula.recaudacionMusd - pelicula.presupuestoMusd) * 100) / 100);
  });

  it('camposPorDefecto agrega los incluidos al final', () => {
    assert.equal(camposPorDefecto([]).length, 15);
    assert.deepEqual(camposPorDefecto(['ganancia']).slice(-1), ['ganancia']);
  });

  it('el esquema describe solo los campos pedidos y exige todos', () => {
    const esquema = esquemaDe(['id', 'subgenero', 'director']);
    assert.deepEqual(Object.keys(esquema.properties), ['id', 'subgenero', 'director']);
    assert.deepEqual(esquema.required, ['id', 'subgenero', 'director']);
    assert.equal(esquema.additionalProperties, false);
    assert.equal(esquema.properties.director.type, 'object');
  });
});

describe('catalogo', () => {
  it('sube la version y la fecha al agregar y eliminar', () => {
    const { catalogo, avanzar } = crearCatalogo();
    const inicial = catalogo.actualizadoEn.getTime();
    avanzar(5000);
    const nueva = catalogo.agregar({ ...NUEVA, estreno: '2024-01-01', sinopsis: '', etiquetas: [] });
    assert.equal(catalogo.version, 2);
    assert.equal(catalogo.actualizadoEn.getTime(), inicial + 5000);
    assert.equal(nueva.id, 61);
    catalogo.eliminar(61);
    assert.equal(catalogo.version, 3);
    assert.equal(catalogo.pelicula(61), null);
  });

  it('rechaza duplicados por titulo y anio y no cambia la version', () => {
    const { catalogo } = crearCatalogo();
    const existente = catalogo.pelicula(1);
    assert.throws(() => catalogo.agregar({ ...NUEVA, titulo: existente.titulo.toUpperCase(), anio: existente.anio }), rechazaCon('PELICULA_DUPLICADA'));
    assert.equal(catalogo.version, 1);
    assert.throws(() => catalogo.eliminar(9999), rechazaCon('PELICULA_NO_ENCONTRADA'));
  });
});

describe('validacion de la exportacion', () => {
  it('usa valores por defecto', () => {
    const r = leerExportacion({});
    assert.equal(r.forma, 'arreglo');
    assert.equal(r.pretty, false);
    assert.equal(r.campos.length, 15);
    assert.deepEqual(r.orden, { campo: 'id', direccion: 'asc' });
    assert.equal(r.descargar, true);
    assert.equal(r.compresion, 'auto');
  });

  it('lee campos, incluir, orden y filtros', () => {
    const r = leerExportacion({
      campos: 'titulo,director', incluir: 'director', orden: 'calificacion:desc', subgenero: 'gore', desde: '1990', calificacionMin: '7.5', directorId: '3', q: ' casa ',
    });
    assert.deepEqual(r.campos, ['titulo', 'director']);
    assert.deepEqual(r.orden, { campo: 'calificacion', direccion: 'desc' });
    assert.deepEqual([r.filtros.subgenero, r.filtros.desde, r.filtros.calificacionMin, r.filtros.directorId, r.filtros.q], ['gore', 1990, 7.5, 3, 'casa']);
  });

  it('un campo incluido solo se puede pedir si se incluyo', () => {
    assert.throws(() => leerExportacion({ campos: 'id,director' }), (e) => e.detalles[0].campo === 'campos');
    assert.deepEqual(leerExportacion({ campos: 'id,ganancia', incluir: 'ganancia' }).campos, ['id', 'ganancia']);
  });

  it('acumula todos los errores', () => {
    assert.throws(
      () => leerExportacion({
        forma: 'xml', pretty: 'si', campos: 'id,id', incluir: 'extra', orden: 'color', limite: '0', compresion: 'zip', desde: '2000', hasta: '1990', raro: '1',
      }),
      (e) => rechazaCon('VALIDACION')(e) && e.detalles.length === 9,
    );
  });

  it('pretty no se puede combinar con ndjson', () => {
    assert.throws(() => leerExportacion({ forma: 'ndjson', pretty: 'true' }), (e) => e.detalles[0].campo === 'pretty');
    assert.equal(leerExportacion({ forma: 'ndjson' }).pretty, false);
  });

  it('el nombre solo se acepta cuando se pide', () => {
    assert.throws(() => leerExportacion({ nombre: 'x' }), rechazaCon('VALIDACION'));
    assert.equal(leerExportacion({ nombre: ' mi corte ' }, { conNombre: true }).nombre, 'mi corte');
    assert.equal(leerExportacion({}, { conNombre: true }).nombre, null);
    assert.throws(() => leerExportacion({ nombre: 'x'.repeat(61) }, { conNombre: true }), rechazaCon('VALIDACION'));
  });

  it('esquema y listado validan sus parametros', () => {
    assert.deepEqual(leerEsquema({ campos: 'id,titulo' }).campos, ['id', 'titulo']);
    assert.throws(() => leerEsquema({ forma: 'x' }), rechazaCon('VALIDACION'));
    assert.throws(() => leerListado({ limite: '0', orden: 'x:y:z' }), rechazaCon('VALIDACION'));
  });
});

describe('validarPelicula', () => {
  const { catalogo } = crearCatalogo();
  const validar = (cambios) => validarPelicula({ ...NUEVA, ...cambios }, { anioMaximo: 2026, catalogo });
  const camposConError = (cambios) => {
    try {
      validar(cambios);
      return [];
    } catch (error) {
      return error.detalles.map((d) => d.campo);
    }
  };

  it('acepta una pelicula correcta y completa los valores opcionales', () => {
    const r = validar({});
    assert.equal(r.estreno, '2024-01-01');
    assert.equal(r.sinopsis, '');
    assert.deepEqual(r.etiquetas, []);
  });

  it('normaliza las etiquetas', () => {
    assert.deepEqual(validar({ etiquetas: [' Sustos ', 'sustos', 'Cabana'] }).etiquetas, ['sustos', 'cabana']);
  });

  it('valida cada campo', () => {
    assert.deepEqual(camposConError({ titulo: '' }), ['titulo']);
    assert.deepEqual(camposConError({ anio: 1900 }), ['anio']);
    assert.deepEqual(camposConError({ subgenero: 'comedia' }), ['subgenero']);
    assert.deepEqual(camposConError({ duracionMin: 10 }), ['duracionMin']);
    assert.deepEqual(camposConError({ clasificacion: 'G' }), ['clasificacion']);
    assert.deepEqual(camposConError({ calificacion: 10.5 }), ['calificacion']);
    assert.deepEqual(camposConError({ calificacion: 6.55 }), ['calificacion']);
    assert.deepEqual(camposConError({ presupuestoMusd: -1 }), ['presupuestoMusd']);
    assert.deepEqual(camposConError({ estreno: '2023-05-05' }), ['estreno']);
    assert.deepEqual(camposConError({ estreno: '2024-02-30' }), ['estreno']);
    assert.deepEqual(camposConError({ etiquetas: 'x' }), ['etiquetas']);
    assert.deepEqual(camposConError({ directorId: 999 }), ['directorId']);
    assert.deepEqual(camposConError({ repartoIds: [] }), ['repartoIds']);
    assert.deepEqual(camposConError({ repartoIds: [1, 1] }), ['repartoIds']);
    assert.deepEqual(camposConError({ repartoIds: [1, 999] }), ['repartoIds']);
    assert.deepEqual(camposConError({ id: 5 }), ['id']);
  });

  it('exige un objeto', () => {
    assert.throws(() => validarPelicula([], { anioMaximo: 2026, catalogo }), rechazaCon('VALIDACION'));
  });
});
