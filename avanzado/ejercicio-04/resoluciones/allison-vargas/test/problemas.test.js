import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crear } from '../src/domain/errores/index.js';
import { crearHttp } from '../src/http/errores-http.js';
import { CATALOGO_HTTP } from '../src/http/errores-http.js';
import { ESTADO_POR_CATEGORIA, aProblema, listarCatalogo, normalizar } from '../src/http/problemas.js';

const contexto = { instance: '/avanzado/ejercicio-04/partidas/1/unirse', idPeticion: 'abc-12345' };

describe('aProblema con errores de dominio', () => {
  it('traduce cada categoria a su estado http', () => {
    const casos = [
      ['JUGADOR_NO_ENCONTRADO', { jugadorId: 1 }, 404],
      ['NICK_EN_USO', { nick: 'a' }, 409],
      ['PARTIDA_NO_EN_CURSO', {}, 409],
      ['AUTO_ATAQUE', {}, 422],
      ['JUGADOR_SUSPENDIDO', { jugadorId: 1 }, 403],
    ];
    for (const [codigo, datos, esperado] of casos) {
      assert.equal(aProblema(crear(codigo, datos), contexto).status, esperado, codigo);
    }
  });

  it('arma un cuerpo problem+json completo', () => {
    const { cuerpo, inesperado, cabeceras } = aProblema(crear('PARTIDA_LLENA', { inscritos: 4, capacidad: 4 }), contexto);
    assert.equal(inesperado, false);
    assert.deepEqual(cabeceras, {});
    assert.deepEqual(cuerpo, {
      type: '/avanzado/ejercicio-04/errores/PARTIDA_LLENA',
      title: 'Partida llena',
      status: 409,
      detail: 'La partida esta llena (4/4)',
      instance: contexto.instance,
      codigo: 'PARTIDA_LLENA',
      categoria: 'conflicto',
      reintentable: false,
      sugerencia: 'Busca otra partida abierta o crea una nueva',
      contexto: { inscritos: 4, capacidad: 4 },
      idPeticion: 'abc-12345',
    });
  });

  it('no expone la causa ni la pila del error', () => {
    const causa = new Error('secreto interno');
    const { cuerpo } = aProblema(crear('PARTIDA_NO_ENCONTRADA', { partidaId: 1 }, { causa }), contexto);
    const texto = JSON.stringify(cuerpo);
    assert.doesNotMatch(texto, /secreto/);
    assert.doesNotMatch(texto, /stack|pila/);
  });

  it('el contexto de la respuesta es una copia', () => {
    const error = crear('SIN_ARMA', { jugadorId: 1 });
    const { cuerpo } = aProblema(error, contexto);
    cuerpo.contexto.jugadorId = 99;
    assert.equal(error.contexto.jugadorId, 1);
  });
});

describe('aProblema con errores http', () => {
  it('incluye la lista de errores de validacion', () => {
    const detalles = [{ campo: 'nick', mensaje: 'es obligatorio' }];
    const { status, cuerpo } = aProblema(crearHttp('VALIDACION', 'Los datos enviados no son validos', { detalles }), contexto);
    assert.equal(status, 400);
    assert.equal(cuerpo.categoria, 'http');
    assert.deepEqual(cuerpo.errores, detalles);
  });

  it('respeta cada estado del catalogo http', () => {
    for (const [codigo, definicion] of Object.entries(CATALOGO_HTTP)) {
      if (codigo === 'ERROR_INTERNO') continue;
      assert.equal(aProblema(crearHttp(codigo, 'x'), contexto).status, definicion.status, codigo);
    }
  });

  it('rechaza codigos http desconocidos', () => {
    assert.throws(() => crearHttp('NO_EXISTE', 'x'), TypeError);
  });
});

describe('errores inesperados', () => {
  it('se convierten en un 500 generico sin detalles internos', () => {
    const { status, cuerpo, inesperado } = aProblema(new Error('password=1234'), contexto);
    assert.equal(status, 500);
    assert.equal(inesperado, true);
    assert.equal(cuerpo.codigo, 'ERROR_INTERNO');
    assert.equal(cuerpo.reintentable, true);
    assert.doesNotMatch(JSON.stringify(cuerpo), /password/);
  });

  it('tambien cubren valores que no son Error', () => {
    assert.equal(aProblema('texto suelto', contexto).status, 500);
    assert.equal(aProblema(undefined, contexto).status, 500);
  });
});

describe('normalizar', () => {
  it('reconoce los errores del parser de body', () => {
    assert.equal(normalizar({ type: 'entity.parse.failed' }).codigo, 'JSON_INVALIDO');
    assert.equal(normalizar({ type: 'entity.too.large' }).codigo, 'PAYLOAD_GRANDE');
  });

  it('deja pasar los errores propios y descarta los desconocidos', () => {
    const propio = crear('AUTO_ATAQUE');
    assert.equal(normalizar(propio), propio);
    assert.equal(normalizar(new Error('x')), null);
  });
});

describe('listarCatalogo', () => {
  const catalogo = listarCatalogo();

  it('trae dominio y http sin codigos repetidos', () => {
    assert.equal(new Set(catalogo.map((e) => e.codigo)).size, catalogo.length);
    assert.ok(catalogo.some((e) => e.origen === 'dominio'));
    assert.ok(catalogo.some((e) => e.origen === 'http'));
  });

  it('cada entrada tiene estado valido y url del tipo', () => {
    for (const entrada of catalogo) {
      assert.ok(entrada.status >= 400 && entrada.status < 600, entrada.codigo);
      assert.equal(entrada.type, `/avanzado/ejercicio-04/errores/${entrada.codigo}`);
    }
  });

  it('el estado de dominio coincide con el de su categoria', () => {
    for (const entrada of catalogo.filter((e) => e.origen === 'dominio')) {
      assert.equal(entrada.status, ESTADO_POR_CATEGORIA[entrada.categoria], entrada.codigo);
    }
  });
});
