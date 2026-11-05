import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CATALOGO,
  CATEGORIAS,
  CODIGOS,
  ErrorDeConflicto,
  ErrorDeDominio,
  ErrorDeEstado,
  ErrorDePermiso,
  ErrorDeRegla,
  ErrorNoEncontrado,
  crear,
  esErrorDeDominio,
} from '../src/domain/errores/index.js';
import { ESTADO_POR_CATEGORIA } from '../src/http/problemas.js';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src');

function archivos(directorio) {
  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const completa = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) return archivos(completa);
    return entrada.name.endsWith('.js') ? [completa] : [];
  });
}

const fuentes = archivos(raiz).map((ruta) => ({ ruta, texto: readFileSync(ruta, 'utf-8') }));

describe('catalogo de errores de dominio', () => {
  it('cada codigo usa MAYUSCULAS_CON_GUION_BAJO y tiene titulo, mensaje y sugerencia', () => {
    for (const codigo of CODIGOS) {
      const definicion = CATALOGO[codigo];
      assert.match(codigo, /^[A-Z][A-Z_]+$/);
      assert.ok(definicion.titulo.length > 3, codigo);
      assert.ok(definicion.sugerencia.length > 3, codigo);
      assert.equal(typeof definicion.mensaje, 'function', codigo);
      assert.equal(typeof definicion.reintentable, 'boolean', codigo);
    }
  });

  it('no repite codigos', () => {
    assert.equal(new Set(CODIGOS).size, CODIGOS.length);
  });

  it('cada categoria tiene un estado http asignado', () => {
    assert.deepEqual([...CATEGORIAS].sort(), Object.keys(ESTADO_POR_CATEGORIA).sort());
    for (const codigo of CODIGOS) {
      assert.ok(CATEGORIAS.includes(CATALOGO[codigo].clase.categoria), codigo);
    }
  });

  it('los mensajes se generan a partir del contexto', () => {
    assert.equal(crear('PARTIDA_LLENA', { inscritos: 4, capacidad: 4 }).message, 'La partida esta llena (4/4)');
    assert.equal(crear('PARTIDA_NO_ENCONTRADA', { partidaId: 9 }).message, 'No existe la partida 9');
  });

  it('cada codigo del dominio y de los servicios existe en el catalogo', () => {
    const usados = new Set();
    for (const { texto } of fuentes) {
      for (const [, codigo] of texto.matchAll(/crear\('([A-Z_]+)'/g)) usados.add(codigo);
    }
    for (const codigo of usados) assert.ok(CATALOGO[codigo], `codigo sin definir: ${codigo}`);
  });

  it('no quedan codigos del catalogo sin usar', () => {
    const texto = fuentes
      .filter(({ ruta }) => !ruta.includes(`errores${path.sep}catalogo.js`))
      .map((fuente) => fuente.texto)
      .join('\n');
    const sinUso = CODIGOS.filter((codigo) => !texto.includes(`'${codigo}'`));
    assert.deepEqual(sinUso, []);
  });

  it('el dominio no conoce http ni express', () => {
    const dominio = fuentes.filter(({ ruta }) => ruta.includes(`${path.sep}domain${path.sep}`));
    assert.ok(dominio.length >= 5);
    for (const { ruta, texto } of dominio) {
      assert.doesNotMatch(texto, /express|statusCode|\bres\.|\breq\.|\/http\b/, ruta);
    }
  });
});

describe('crear', () => {
  it('devuelve la clase que corresponde a cada categoria', () => {
    assert.ok(crear('JUGADOR_NO_ENCONTRADO', { jugadorId: 1 }) instanceof ErrorNoEncontrado);
    assert.ok(crear('NICK_EN_USO', { nick: 'a' }) instanceof ErrorDeConflicto);
    assert.ok(crear('PARTIDA_NO_EN_CURSO') instanceof ErrorDeEstado);
    assert.ok(crear('AUTO_ATAQUE') instanceof ErrorDeRegla);
    assert.ok(crear('JUGADOR_SUSPENDIDO', { jugadorId: 1 }) instanceof ErrorDePermiso);
  });

  it('todos son ErrorDeDominio y Error con nombre, codigo y categoria', () => {
    const error = crear('SIN_ARMA', { jugadorId: 3 });
    assert.ok(error instanceof ErrorDeDominio);
    assert.ok(error instanceof Error);
    assert.ok(esErrorDeDominio(error));
    assert.equal(error.name, 'ErrorDeRegla');
    assert.equal(error.codigo, 'SIN_ARMA');
    assert.equal(error.categoria, 'regla_de_negocio');
    assert.ok(error.stack.includes('SIN_ARMA') || error.stack.includes('ErrorDeRegla'));
  });

  it('congela el contexto y no comparte la referencia original', () => {
    const contexto = { jugadorId: 3 };
    const error = crear('SIN_ARMA', contexto);
    contexto.jugadorId = 99;
    assert.equal(error.contexto.jugadorId, 3);
    assert.ok(Object.isFrozen(error.contexto));
  });

  it('conserva la causa original sin mezclarla con el mensaje', () => {
    const causa = new Error('fallo del almacenamiento');
    const error = crear('PARTIDA_NO_ENCONTRADA', { partidaId: 1 }, { causa });
    assert.equal(error.cause, causa);
    assert.doesNotMatch(error.message, /almacenamiento/);
  });

  it('rechaza codigos desconocidos', () => {
    assert.throws(() => crear('NO_EXISTE'), TypeError);
  });

  it('esErrorDeDominio distingue errores comunes', () => {
    assert.equal(esErrorDeDominio(new Error('x')), false);
    assert.equal(esErrorDeDominio(null), false);
  });
});
