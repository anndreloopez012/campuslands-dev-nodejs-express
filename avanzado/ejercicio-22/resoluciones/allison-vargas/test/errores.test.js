import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATALOGO, ErrorDeNegocio, crear, esErrorDeNegocio } from '../src/errores/index.js';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src');

function archivos(directorio) {
  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const completa = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) return archivos(completa);
    return entrada.name.endsWith('.js') ? [completa] : [];
  });
}

const textoFuente = archivos(raiz)
  .filter((ruta) => !ruta.includes(`${path.sep}errores${path.sep}`))
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

  it('todo codigo usado existe y ninguno queda sin usar', () => {
    const usados = new Set([...textoFuente.matchAll(/crear\('([A-Z_]+)'/g)].map((m) => m[1]));
    for (const codigo of usados) assert.ok(CATALOGO[codigo], `sin definir: ${codigo}`);
    const sinUso = Object.keys(CATALOGO).filter((codigo) => !textoFuente.includes(`'${codigo}'`));
    assert.deepEqual(sinUso, []);
  });

  it('crear congela el contexto, conserva la causa y rechaza codigos desconocidos', () => {
    const causa = new Error('origen');
    const error = crear('JSON_INVALIDO', { x: 1 }, { causa });
    assert.ok(error instanceof ErrorDeNegocio);
    assert.ok(Object.isFrozen(error.contexto));
    assert.equal(error.cause, causa);
    assert.throws(() => crear('NO_EXISTE'), TypeError);
    assert.equal(esErrorDeNegocio(causa), false);
    assert.equal(esErrorDeNegocio(crear('VALIDACION')), true);
  });
});
