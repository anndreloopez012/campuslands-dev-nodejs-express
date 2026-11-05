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
    const usados = new Set([...textoFuente.matchAll(/crear\('([A-Z_]+)'/g)].map((m) => m[1]));
    for (const codigo of usados) assert.ok(CATALOGO[codigo], `sin definir: ${codigo}`);
    const sinUso = Object.keys(CATALOGO).filter((codigo) => !textoFuente.includes(`'${codigo}'`));
    assert.deepEqual(sinUso, []);
  });

  it('crear arma el mensaje con el contexto y congela el contexto', () => {
    const error = crear('LIMITE_DE_BUZONES', { maximo: 20 });
    assert.ok(error instanceof ErrorDeNegocio);
    assert.equal(error.status, 409);
    assert.equal(error.message, 'Ya existen 20 buzones; elimina alguno antes de crear otro');
    assert.ok(Object.isFrozen(error.contexto));
  });

  it('crear rechaza codigos desconocidos y conserva la causa', () => {
    assert.throws(() => crear('NO_EXISTE'), TypeError);
    const causa = new Error('origen');
    assert.equal(crear('JSON_INVALIDO', {}, { causa }).cause, causa);
    assert.equal(esErrorDeNegocio(causa), false);
    assert.equal(esErrorDeNegocio(crear('VALIDACION')), true);
  });
});
