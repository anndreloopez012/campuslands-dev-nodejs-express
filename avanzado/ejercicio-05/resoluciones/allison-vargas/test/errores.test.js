import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CATALOGO,
  ErrorDeNegocio,
  crear,
  esErrorDeNegocio,
  esErrorDeRegla,
} from '../src/errores/index.js';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src');

function archivos(directorio) {
  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const completa = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) return archivos(completa);
    return entrada.name.endsWith('.js') ? [completa] : [];
  });
}

const textoFuente = archivos(raiz)
  .filter((ruta) => !ruta.endsWith(`errores${path.sep}index.js`))
  .map((ruta) => readFileSync(ruta, 'utf-8'))
  .join('\n');

describe('catalogo de errores', () => {
  it('cada codigo tiene un estado http valido y un mensaje', () => {
    for (const [codigo, definicion] of Object.entries(CATALOGO)) {
      assert.match(codigo, /^[A-Z][A-Z_]+$/);
      assert.ok(definicion.status >= 400 && definicion.status < 600, codigo);
      assert.equal(typeof definicion.mensaje, 'function', codigo);
    }
  });

  it('todo codigo usado en el codigo existe y ninguno queda sin usar', () => {
    const usados = new Set([...textoFuente.matchAll(/(?:crear|rechazaCon)\('([A-Z_]+)'/g)].map((m) => m[1]));
    for (const codigo of usados) assert.ok(CATALOGO[codigo], `sin definir: ${codigo}`);
    const sinUso = Object.keys(CATALOGO).filter((codigo) => !textoFuente.includes(`'${codigo}'`));
    assert.deepEqual(sinUso, []);
  });

  it('crear arma el mensaje con el contexto y congela el contexto', () => {
    const error = crear('PRESUPUESTO_INSUFICIENTE', { clubId: 4, necesario: 10, disponible: 3, faltan: 7 });
    assert.ok(error instanceof ErrorDeNegocio);
    assert.equal(error.status, 422);
    assert.equal(error.message, 'El club 4 necesita 10 y solo dispone de 3');
    assert.ok(Object.isFrozen(error.contexto));
  });

  it('crear rechaza codigos desconocidos y conserva la causa', () => {
    assert.throws(() => crear('NO_EXISTE'), TypeError);
    const causa = new Error('origen');
    assert.equal(crear('JSON_INVALIDO', {}, { causa }).cause, causa);
  });

  it('distingue errores de regla de errores de infraestructura', () => {
    assert.equal(esErrorDeRegla(crear('MISMO_CLUB', { jugadorId: 1, clubId: 1 })), true);
    assert.equal(esErrorDeRegla(crear('CONFLICTO_DE_VERSION', { coleccion: 'a', id: 1 })), false);
    assert.equal(esErrorDeRegla(crear('VALIDACION')), false);
    assert.equal(esErrorDeNegocio(new Error('x')), false);
  });
});
