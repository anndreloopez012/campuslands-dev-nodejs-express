import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MINUTO, levantarApi } from '../soporte/api.js';

async function conApi(prueba) {
  const api = await levantarApi();
  try {
    await prueba(api);
  } finally {
    await api.cerrar();
  }
}

describe('login', () => {
  it('entrega access y refresh token sin dejarlos en cache', () => conApi(async (api) => {
    const r = await api.login('valentina', { 'user-agent': 'navegador/1' });
    assert.equal(r.status, 200);
    assert.equal(r.cabeceras.get('cache-control'), 'no-store');
    const { data } = r.cuerpo;
    assert.equal(data.tokenType, 'Bearer');
    assert.equal(data.expiraEnS, 300);
    assert.equal(data.accessToken.split('.').length, 3);
    assert.match(data.refreshToken, /^[0-9a-f-]{36}\.[\w-]{43}$/);
    assert.equal(data.refreshVenceEn, '2026-11-12T12:00:00.000Z');
    const yo = await api.comoUsuario(data.accessToken, '/auth/yo');
    assert.equal(yo.cuerpo.data.email, 'valentina@viajes.test');
    assert.equal(yo.cuerpo.data.sesionId, data.sesionId);
  }));

  it('no distingue correo inexistente de contrasena incorrecta y bloquea tras 5 fallos', () => conApi(async (api) => {
    const noExiste = await api.login({ email: 'nadie@viajes.test', contrasena: 'x' });
    const mala = await api.login({ email: 'tomas@viajes.test', contrasena: 'x' });
    assert.equal(noExiste.status, 401);
    assert.deepEqual(noExiste.cuerpo, mala.cuerpo);
    assert.equal(mala.cabeceras.get('www-authenticate'), 'Bearer realm="viajes"');
    for (let i = 0; i < 4; i += 1) await api.login({ email: 'TOMAS@viajes.test', contrasena: 'x' });
    const bloqueado = await api.login('tomas');
    assert.equal(bloqueado.status, 429);
    assert.equal(bloqueado.cuerpo.codigo, 'LOGIN_BLOQUEADO');
    assert.equal(bloqueado.cabeceras.get('retry-after'), '900');
    api.avanzar(15 * MINUTO);
    assert.equal((await api.login('tomas')).status, 200);
    const invalido = await api.json('/auth/login', { email: 'a', extra: 1 });
    assert.equal(invalido.status, 400);
  }));
});

describe('access token', () => {
  it('protege rutas y expira a los 5 minutos', () => conApi(async (api) => {
    const sin = await api.pedir('/reservas');
    assert.equal(sin.cuerpo.codigo, 'NO_AUTENTICADO');
    assert.equal(sin.cabeceras.get('www-authenticate'), 'Bearer realm="viajes"');
    const basic = await api.pedir('/reservas', { headers: { authorization: 'Basic abc' } });
    assert.equal(basic.cuerpo.codigo, 'TOKEN_INVALIDO');
    assert.equal(basic.cuerpo.contexto, undefined);
    const { accessToken } = (await api.login('valentina')).cuerpo.data;
    assert.equal((await api.comoUsuario(accessToken, '/reservas')).status, 200);
    api.avanzar(5 * MINUTO);
    const vencido = await api.comoUsuario(accessToken, '/reservas');
    assert.equal(vencido.status, 401);
    assert.equal(vencido.cuerpo.codigo, 'TOKEN_EXPIRADO');
    assert.equal(vencido.cabeceras.get('www-authenticate'), 'Bearer realm="viajes", error="invalid_token"');
  }));
});

describe('refresh', () => {
  it('renueva el access token y rota el refresh token', () => conApi(async (api) => {
    const login = (await api.login('valentina')).cuerpo.data;
    api.avanzar(6 * MINUTO);
    const r = await api.refrescar(login.refreshToken);
    assert.equal(r.status, 200);
    assert.equal(r.cabeceras.get('cache-control'), 'no-store');
    assert.notEqual(r.cuerpo.data.refreshToken, login.refreshToken);
    assert.equal(r.cuerpo.data.sesionId, login.sesionId);
    assert.equal((await api.comoUsuario(r.cuerpo.data.accessToken, '/reservas')).status, 200);
  }));

  it('detecta el robo: reutilizar un refresh viejo cierra la sesion para todos', () => conApi(async (api) => {
    const login = (await api.login('valentina')).cuerpo.data;
    const legitimo = (await api.refrescar(login.refreshToken)).cuerpo.data;
    const atacante = await api.refrescar(login.refreshToken);
    assert.equal(atacante.status, 401);
    assert.equal(atacante.cuerpo.codigo, 'REFRESH_REUTILIZADO');
    const siguiente = await api.refrescar(legitimo.refreshToken);
    assert.equal(siguiente.cuerpo.codigo, 'SESION_REVOCADA');
    const acceso = await api.comoUsuario(legitimo.accessToken, '/reservas');
    assert.equal(acceso.cuerpo.codigo, 'SESION_REVOCADA');
    assert.equal((await api.refrescar('inventado.token')).cuerpo.codigo, 'REFRESH_INVALIDO');
    assert.equal((await api.json('/auth/refresh', {})).status, 400);
  }));
});

describe('sesiones', () => {
  it('cerrar sesion invalida al instante el access token y el refresh', () => conApi(async (api) => {
    const login = (await api.login('tomas')).cuerpo.data;
    const salir = await api.comoUsuario(login.accessToken, '/auth/logout', { method: 'POST' });
    assert.equal(salir.status, 204);
    assert.equal((await api.comoUsuario(login.accessToken, '/auth/yo')).cuerpo.codigo, 'SESION_REVOCADA');
    assert.equal((await api.refrescar(login.refreshToken)).cuerpo.codigo, 'SESION_REVOCADA');
  }));

  it('lista las sesiones, marca la actual y permite cerrar otras o todas', () => conApi(async (api) => {
    const movil = (await api.login('valentina', { 'user-agent': 'movil' })).cuerpo.data;
    const notebook = (await api.login('valentina', { 'user-agent': 'notebook' })).cuerpo.data;
    const lista = (await api.comoUsuario(notebook.accessToken, '/auth/sesiones')).cuerpo.data;
    assert.deepEqual(lista.map((s) => [s.agente, s.actual]), [['movil', false], ['notebook', true]]);
    const cerrar = await api.comoUsuario(notebook.accessToken, `/auth/sesiones/${movil.sesionId}`, { method: 'DELETE' });
    assert.equal(cerrar.status, 204);
    assert.equal((await api.comoUsuario(movil.accessToken, '/auth/yo')).status, 401);
    const ajena = (await api.login('tomas')).cuerpo.data;
    const otra = await api.comoUsuario(notebook.accessToken, `/auth/sesiones/${ajena.sesionId}`, { method: 'DELETE' });
    assert.equal(otra.cuerpo.codigo, 'SESION_NO_ENCONTRADA');
    assert.equal((await api.comoUsuario(notebook.accessToken, '/auth/sesiones/123', { method: 'DELETE' })).status, 400);
    await api.login('valentina');
    const todas = await api.comoUsuario(notebook.accessToken, '/auth/logout-todas', { method: 'POST' });
    assert.equal(todas.cuerpo.cerradas, 2);
    assert.equal((await api.comoUsuario(ajena.accessToken, '/auth/yo')).status, 200);
  }));
});

describe('reservas', () => {
  it('cada viajero ve y cancela solo lo suyo; el admin ve todo', () => conApi(async (api) => {
    const vale = (await api.login('valentina')).cuerpo.data.accessToken;
    const tomas = (await api.login('tomas')).cuerpo.data.accessToken;
    const admin = (await api.login('admin')).cuerpo.data.accessToken;
    const r = await api.jsonComo(vale, '/reservas', { destinoId: 5, fecha: '2026-12-20', personas: 3 });
    assert.equal(r.status, 201);
    assert.equal(r.cuerpo.data.total, 2_670_000);
    const sinCupo = await api.jsonComo(tomas, '/reservas', { destinoId: 5, fecha: '2026-12-21', personas: 2 });
    assert.equal(sinCupo.cuerpo.codigo, 'CUPOS_INSUFICIENTES');
    assert.equal((await api.comoUsuario(tomas, '/reservas')).cuerpo.data.length, 0);
    assert.equal((await api.comoUsuario(admin, '/reservas')).cuerpo.data.length, 1);
    const ajena = await api.comoUsuario(tomas, `/reservas/${r.cuerpo.data.id}`, { method: 'DELETE' });
    assert.equal(ajena.status, 403);
    const porAdmin = await api.comoUsuario(admin, `/reservas/${r.cuerpo.data.id}`, { method: 'DELETE' });
    assert.equal(porAdmin.cuerpo.data.estado, 'cancelada');
    const destinos = (await api.pedir('/destinos')).cuerpo.data;
    assert.equal(destinos.find((d) => d.id === 5).disponibles, 4);
  }));

  it('valida fechas reales y futuras', () => conApi(async (api) => {
    const token = (await api.login('valentina')).cuerpo.data.accessToken;
    const pasada = await api.jsonComo(token, '/reservas', { destinoId: 1, fecha: '2026-11-05', personas: 1 });
    assert.equal(pasada.cuerpo.errores[0].mensaje, 'debe ser posterior a hoy');
    const irreal = await api.jsonComo(token, '/reservas', { destinoId: 1, fecha: '2026-02-30', personas: 1 });
    assert.equal(irreal.cuerpo.errores[0].mensaje, 'no es una fecha real');
    const destino = await api.jsonComo(token, '/reservas', { destinoId: 99, fecha: '2027-01-10', personas: 1 });
    assert.equal(destino.cuerpo.codigo, 'DESTINO_NO_ENCONTRADO');
    assert.equal((await api.comoUsuario(token, '/reservas/99', { method: 'DELETE' })).cuerpo.codigo, 'RESERVA_NO_ENCONTRADA');
    assert.equal((await api.pedir('/')).cuerpo.topic, 'refresh tokens conceptual');
  }));
});
