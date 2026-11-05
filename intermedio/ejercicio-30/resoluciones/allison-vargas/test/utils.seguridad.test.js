import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verificarPassword } from '../src/utils/password.js';
import { crearTokens } from '../src/utils/tokens.js';
import { leerConfig } from '../src/config/index.js';

describe('passwords', () => {
  it('verifica la password correcta y rechaza la incorrecta', () => {
    const guardado = hashPassword('Secreta123');
    assert.equal(verificarPassword('Secreta123', guardado), true);
    assert.equal(verificarPassword('secreta123', guardado), false);
    assert.equal(verificarPassword('', guardado), false);
  });

  it('usa una sal distinta cada vez y no guarda la password en claro', () => {
    const a = hashPassword('Secreta123');
    const b = hashPassword('Secreta123');
    assert.notEqual(a, b);
    assert.equal(a.includes('Secreta123'), false);
    assert.match(a, /^[0-9a-f]{32}:[0-9a-f]{64}$/);
  });
});

describe('tokens', () => {
  let ahora = new Date('2026-11-04T12:00:00.000Z');
  const tokens = crearTokens({ secreto: 'clave-de-prueba', duracionSeg: 60, reloj: () => ahora });

  it('emite un token que se puede verificar', () => {
    const { token, exp } = tokens.emitir({ sub: 7 });
    assert.equal(exp, Math.floor(ahora.getTime() / 1000) + 60);
    assert.deepEqual(tokens.verificar(token), { sub: 7, exp });
  });

  it('rechaza tokens alterados, mal formados o de otra clave', () => {
    const { token } = tokens.emitir({ sub: 7 });
    const [cuerpo, firma] = token.split('.');
    const falso = Buffer.from(JSON.stringify({ sub: 1, exp: 9999999999 })).toString('base64url');
    const ajeno = crearTokens({ secreto: 'otra-clave', duracionSeg: 60, reloj: () => ahora }).emitir({ sub: 7 }).token;
    for (const malo of [`${falso}.${firma}`, `${cuerpo}.x${firma}`, `${cuerpo}`, `${cuerpo}.${firma}.extra`, '', 'a.b', ajeno, undefined, 12]) {
      assert.throws(() => tokens.verificar(malo), { codigo: 'TOKEN_INVALIDO' }, String(malo));
    }
  });

  it('rechaza un token vencido', () => {
    const { token } = tokens.emitir({ sub: 7 });
    const antes = ahora;
    ahora = new Date(antes.getTime() + 61 * 1000);
    assert.throws(() => tokens.verificar(token), { codigo: 'TOKEN_INVALIDO' });
    ahora = antes;
  });

  it('rechaza un cuerpo firmado pero que no es JSON', () => {
    const cuerpo = Buffer.from('no es json').toString('base64url');
    const firma = crearTokens({ secreto: 'clave-de-prueba', duracionSeg: 60 });
    assert.throws(() => firma.verificar(`${cuerpo}.${'a'.repeat(43)}`), { codigo: 'TOKEN_INVALIDO' });
  });
});

describe('configuracion', () => {
  it('usa valores por defecto y lee el entorno', () => {
    assert.equal(leerConfig({}).duracionTokenSeg, 3600);
    assert.ok(leerConfig({}).secretoToken.length > 10);
    assert.deepEqual(leerConfig({ TOKEN_SECRET: 'abc', TOKEN_TTL_SEG: '120' }), { secretoToken: 'abc', duracionTokenSeg: 120 });
    assert.equal(leerConfig({ TOKEN_TTL_SEG: 'x' }).duracionTokenSeg, 3600);
    assert.equal(leerConfig({ TOKEN_TTL_SEG: '-5' }).duracionTokenSeg, 3600);
  });
});
