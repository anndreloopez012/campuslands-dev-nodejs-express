import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { firmar, verificar } from '../src/auth/jwt.js';
import { comparar, hashear } from '../src/auth/contrasenas.js';
import { crearAlmacenSesiones } from '../src/auth/sesiones.js';
import { crearControlIntentos } from '../src/auth/intentos.js';
import {
  DIA, MINUTO, SECRETO, crearReloj,
} from '../soporte/api.js';

const conCodigo = (codigo, motivo) => (error) => error.codigo === codigo && (!motivo || error.contexto.motivo === motivo);

function opciones(reloj) {
  return {
    secreto: SECRETO, reloj, duracionS: 300, emisor: 'yo', audiencia: 'app',
  };
}

describe('jwt hs256', () => {
  it('firma y verifica, con iat, exp, emisor y audiencia', () => {
    const { reloj } = crearReloj();
    const token = firmar({ sub: 1, rol: 'viajero' }, opciones(reloj));
    const datos = verificar(token, opciones(reloj));
    assert.equal(datos.sub, 1);
    assert.equal(datos.exp - datos.iat, 300);
    assert.equal(datos.iss, 'yo');
  });

  it('rechaza tokens modificados, con otra clave o con alg=none', () => {
    const { reloj } = crearReloj();
    const token = firmar({ sub: 1, rol: 'viajero' }, opciones(reloj));
    const [cabecera, , firma] = token.split('.');
    const falso = Buffer.from(JSON.stringify({ sub: 1, rol: 'admin', iss: 'yo', aud: 'app', exp: 9999999999 })).toString('base64url');
    assert.throws(() => verificar(`${cabecera}.${falso}.${firma}`, opciones(reloj)), conCodigo('TOKEN_INVALIDO', 'firma'));
    assert.throws(() => verificar(token, { ...opciones(reloj), secreto: 'otra-clave-distinta-de-32-caracteres!!' }), conCodigo('TOKEN_INVALIDO', 'firma'));
    const none = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    assert.throws(() => verificar(`${none}.${falso}.x`, opciones(reloj)), conCodigo('TOKEN_INVALIDO', 'algoritmo'));
    assert.throws(() => verificar('a.b', opciones(reloj)), conCodigo('TOKEN_INVALIDO', 'formato'));
    assert.throws(() => verificar(null, opciones(reloj)), conCodigo('TOKEN_INVALIDO', 'formato'));
  });

  it('rechaza otra audiencia y tokens expirados', () => {
    const { reloj, avanzar } = crearReloj();
    const token = firmar({ sub: 1 }, opciones(reloj));
    assert.throws(() => verificar(token, { ...opciones(reloj), audiencia: 'otra' }), conCodigo('TOKEN_INVALIDO', 'emisor o audiencia'));
    avanzar(299 * 1000);
    assert.doesNotThrow(() => verificar(token, opciones(reloj)));
    avanzar(1000);
    assert.throws(() => verificar(token, opciones(reloj)), conCodigo('TOKEN_EXPIRADO'));
  });

  it('rechaza un cuerpo que no es json aunque la firma sea correcta', () => {
    const { reloj } = crearReloj();
    const cabecera = Buffer.from('{"alg":"HS256"}').toString('base64url');
    const cuerpo = Buffer.from('no es json').toString('base64url');
    const firma = createHmac('sha256', SECRETO).update(`${cabecera}.${cuerpo}`).digest('base64url');
    assert.throws(() => verificar(`${cabecera}.${cuerpo}.${firma}`, opciones(reloj)), conCodigo('TOKEN_INVALIDO', 'contenido'));
  });
});

describe('contrasenas', () => {
  it('guarda un hash scrypt con sal y compara en tiempo constante', () => {
    const hash = hashear('Clave123', { costo: 1024 });
    assert.match(hash, /^scrypt\$1024\$[\w-]+\$[\w-]+$/);
    assert.notEqual(hash, hashear('Clave123', { costo: 1024 }));
    assert.equal(comparar('Clave123', hash), true);
    assert.equal(comparar('clave123', hash), false);
    assert.equal(comparar('x', 'md5$abc'), false);
  });
});

describe('almacen de refresh tokens', () => {
  function almacen(politica) {
    const tiempo = crearReloj();
    return { ...tiempo, sesiones: crearAlmacenSesiones({ reloj: tiempo.reloj, politica }) };
  }

  it('rota: cada refresh entrega un token nuevo y el anterior queda usado', () => {
    const { sesiones } = almacen();
    const inicio = sesiones.iniciar({ usuarioId: 1 });
    const primero = sesiones.rotar(inicio.refreshToken);
    assert.equal(primero.familiaId, inicio.familiaId);
    assert.notEqual(primero.refreshToken, inicio.refreshToken);
    const segundo = sesiones.rotar(primero.refreshToken);
    assert.equal(sesiones.listar(1)[0].rotaciones, 2);
    assert.ok(segundo.refreshToken);
  });

  it('si se reutiliza un token viejo se revoca toda la familia', () => {
    const { sesiones } = almacen();
    const inicio = sesiones.iniciar({ usuarioId: 1 });
    const nuevo = sesiones.rotar(inicio.refreshToken);
    assert.throws(() => sesiones.rotar(inicio.refreshToken), conCodigo('REFRESH_REUTILIZADO'));
    assert.deepEqual(sesiones.estado(inicio.familiaId), { revocada: true, motivo: 'reuso_detectado' });
    assert.throws(() => sesiones.rotar(nuevo.refreshToken), conCodigo('SESION_REVOCADA'));
    assert.equal(sesiones.sesionActiva(inicio.familiaId), false);
  });

  it('rechaza tokens inventados o con el secreto cambiado', () => {
    const { sesiones } = almacen();
    const { refreshToken } = sesiones.iniciar({ usuarioId: 1 });
    const [id] = refreshToken.split('.');
    for (const malo of [`${id}.otro`, 'sin-punto', `${refreshToken}.extra`, 42]) {
      assert.throws(() => sesiones.rotar(malo), conCodigo('REFRESH_INVALIDO'));
    }
  });

  it('expira por inactividad, pero renovarse no pasa del limite absoluto', () => {
    const { sesiones, avanzar } = almacen();
    const quieto = sesiones.iniciar({ usuarioId: 1 });
    avanzar(7 * DIA);
    assert.throws(() => sesiones.rotar(quieto.refreshToken), conCodigo('REFRESH_EXPIRADO'));

    let actual = sesiones.iniciar({ usuarioId: 2 });
    for (let dia = 0; dia < 4; dia += 1) {
      avanzar(6 * DIA);
      actual = sesiones.rotar(actual.refreshToken);
    }
    assert.equal(actual.venceEn, new Date(Date.parse('2026-11-12T12:00:00.000Z') + 30 * DIA).toISOString());
    avanzar(6 * DIA + MINUTO);
    assert.throws(() => sesiones.rotar(actual.refreshToken), conCodigo('REFRESH_EXPIRADO'));
  });

  it('limita las sesiones abiertas por usuario cerrando la mas antigua', () => {
    const { sesiones, avanzar } = almacen({ inactividadMs: DIA, vidaMaximaMs: 2 * DIA, maxSesionesPorUsuario: 2 });
    const a = sesiones.iniciar({ usuarioId: 1 });
    avanzar(MINUTO);
    sesiones.iniciar({ usuarioId: 1 });
    avanzar(MINUTO);
    sesiones.iniciar({ usuarioId: 1 });
    assert.equal(sesiones.listar(1).length, 2);
    assert.deepEqual(sesiones.estado(a.familiaId), { revocada: true, motivo: 'limite_de_sesiones' });
    assert.throws(() => sesiones.revocar(a.familiaId, 99), conCodigo('SESION_NO_ENCONTRADA'));
  });
});

describe('control de intentos', () => {
  it('bloquea tras 5 fallos y se libera despues del bloqueo', () => {
    const { reloj, avanzar } = crearReloj();
    const intentos = crearControlIntentos({ reloj });
    for (let i = 0; i < 4; i += 1) intentos.fallo('a@b.c');
    assert.equal(intentos.bloqueadoHasta('a@b.c'), null);
    assert.equal(intentos.fallo('a@b.c'), 0);
    assert.equal(intentos.bloqueadoHasta('a@b.c'), reloj().getTime() + 15 * MINUTO);
    avanzar(15 * MINUTO);
    assert.equal(intentos.bloqueadoHasta('a@b.c'), null);
    intentos.fallo('x@y.z');
    intentos.exito('x@y.z');
    avanzar(MINUTO);
    for (let i = 0; i < 4; i += 1) intentos.fallo('x@y.z');
    assert.equal(intentos.bloqueadoHasta('x@y.z'), null);
  });
});
