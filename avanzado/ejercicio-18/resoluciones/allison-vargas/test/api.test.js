import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { conApi } from '../soporte/api.js';

describe('identidad y perfil', () => {
  it('exige token y muestra roles efectivos y permisos', () => conApi(async (api) => {
    assert.equal((await api.pedir('/')).cuerpo.topic, 'multirol avanzado');
    const sin = await api.pedir('/yo');
    assert.equal(sin.status, 401);
    const falso = await api.pedir('/yo', { headers: { authorization: 'Bearer tk-nadie' } });
    assert.equal(falso.status, 401);
    const yo = await api.como('martin', '/yo');
    assert.deepEqual(yo.cuerpo.data.roles, ['piloto', 'paracaidista']);
    assert.deepEqual(yo.cuerpo.data.rolesEfectivos, ['alumno', 'paracaidista', 'piloto']);
    assert.ok(yo.cuerpo.data.permisos.includes('manifiesto:ver'));
  }));

  it('solo quien tiene roles:ver lee la definicion de roles', () => conApi(async (api) => {
    assert.equal((await api.como('elena', '/roles')).status, 200);
    const r = await api.como('rosa', '/roles');
    assert.equal(r.status, 403);
    assert.equal(r.cuerpo.contexto.motivo, 'ninguno de tus roles otorga este permiso');
  }));
});

describe('flujo de saltos', () => {
  it('alumna reserva, su instructora aprueba, el piloto asignado despega', () => conApi(async (api) => {
    const s = await api.jsonComo('sofia', '/saltos', { vueloId: 1, tipo: 'tandem' });
    assert.equal(s.status, 201);
    assert.equal(s.cabeceras.get('location'), '/avanzado/ejercicio-18/saltos/1');

    const otroInstructor = await api.jsonComo('felipe', '/saltos/1/resolucion', { decision: 'aprobar' });
    assert.equal(otroInstructor.status, 403);
    assert.equal(otroInstructor.cuerpo.contexto.motivo, 'los saltos de un alumno solo los aprueba su instructor asignado');

    const despegueTemprano = await api.como('martin', '/vuelos/1/despegue', { method: 'POST' });
    assert.equal(despegueTemprano.cuerpo.codigo, 'VUELO_CON_PENDIENTES');

    const aprobado = await api.jsonComo('camila', '/saltos/1/resolucion', { decision: 'aprobar', nota: 'buen briefing' });
    assert.equal(aprobado.cuerpo.data.estado, 'aprobado');
    assert.equal(aprobado.cuerpo.data.resueltoPor, 3);
    const otraVez = await api.jsonComo('camila', '/saltos/1/resolucion', { decision: 'rechazar' });
    assert.equal(otraVez.cuerpo.codigo, 'SALTO_YA_RESUELTO');

    const otroPiloto = await api.como('ana', '/vuelos/1/despegue', { method: 'POST' });
    assert.equal(otroPiloto.cuerpo.contexto.motivo, 'solo el piloto asignado puede despegar');
    const despegue = await api.como('martin', '/vuelos/1/despegue', { method: 'POST' });
    assert.equal(despegue.cuerpo.data.estado, 'en_vuelo');
    assert.equal((await api.como('sofia', '/saltos/1')).cuerpo.data.estado, 'realizado');
    const tarde = await api.jsonComo('diego', '/saltos', { vueloId: 1, tipo: 'libre' });
    assert.equal(tarde.cuerpo.codigo, 'VUELO_NO_DISPONIBLE');
  }));

  it('licencias, duplicados, cupos y aprobaciones propias', () => conApi(async (api) => {
    const libre = await api.jsonComo('sofia', '/saltos', { vueloId: 2, tipo: 'libre' });
    assert.equal(libre.cuerpo.contexto.motivo, 'un salto libre exige licencia A o superior');
    assert.equal((await api.jsonComo('ana', '/saltos', { vueloId: 1, tipo: 'wingsuit' })).status, 201);
    assert.equal((await api.jsonComo('diego', '/saltos', { vueloId: 1, tipo: 'wingsuit' })).status, 403);
    assert.equal((await api.jsonComo('ana', '/saltos', { vueloId: 1, tipo: 'libre' })).cuerpo.codigo, 'SALTO_DUPLICADO');
    await api.jsonComo('diego', '/saltos', { vueloId: 1, tipo: 'libre' });
    const propio = await api.jsonComo('camila', '/saltos', { vueloId: 1, tipo: 'libre' });
    const auto = await api.jsonComo('camila', `/saltos/${propio.cuerpo.data.id}/resolucion`, { decision: 'aprobar' });
    assert.equal(auto.cuerpo.contexto.motivo, 'nadie puede aprobar su propio salto');
    assert.equal((await api.jsonComo('felipe', `/saltos/${propio.cuerpo.data.id}/resolucion`, { decision: 'aprobar' })).status, 200);
    await api.jsonComo('sofia', '/saltos', { vueloId: 1, tipo: 'aff' });
    const lleno = await api.jsonComo('lucas', '/saltos', { vueloId: 1, tipo: 'tandem' });
    assert.equal(lleno.cuerpo.codigo, 'VUELO_LLENO');
    const suspendido = await api.jsonComo('bruno', '/saltos', { vueloId: 2, tipo: 'libre' });
    assert.equal(suspendido.cuerpo.contexto.motivo, 'tu cuenta esta suspendida');
  }));
});

describe('visibilidad', () => {
  it('cada uno ve lo suyo, el instructor ve a sus alumnos y la jefatura todo', () => conApi(async (api) => {
    await api.jsonComo('sofia', '/saltos', { vueloId: 1, tipo: 'tandem' });
    await api.jsonComo('lucas', '/saltos', { vueloId: 1, tipo: 'tandem' });
    await api.jsonComo('diego', '/saltos', { vueloId: 2, tipo: 'libre' });
    const ids = async (quien) => (await api.como(quien, '/saltos')).cuerpo.data.map((s) => s.id);
    assert.deepEqual(await ids('sofia'), [1]);
    assert.deepEqual(await ids('camila'), [1]);
    assert.deepEqual(await ids('rosa'), [1, 2, 3]);
    assert.deepEqual(await ids('martin'), []);
    const ajeno = await api.como('sofia', '/saltos/2');
    assert.equal(ajeno.status, 404);
    assert.equal(ajeno.cuerpo.codigo, 'SALTO_NO_ENCONTRADO');
    const manifiesto = await api.como('martin', '/vuelos/1/manifiesto');
    assert.deepEqual(manifiesto.cuerpo.data.saltadores.map((s) => s.nombre), ['Sofia Alumna', 'Lucas Alumno']);
    assert.equal((await api.como('ana', '/vuelos/1/manifiesto')).status, 403);
    assert.equal((await api.como('rosa', '/vuelos/1/manifiesto')).status, 200);
  }));
});

describe('jefatura y clima', () => {
  it('la jefa crea vuelos con pilotos validos y suspende por clima', () => conApi(async (api) => {
    const vuelo = { avion: 'Twin Otter', pilotoId: 10, hora: '2026-11-07T09:00:00Z', capacidad: 14 };
    assert.equal((await api.jsonComo('camila', '/vuelos', vuelo)).status, 403);
    const creado = await api.jsonComo('rosa', '/vuelos', vuelo);
    assert.equal(creado.status, 201);
    assert.equal(creado.cuerpo.data.hora, '2026-11-07T09:00:00.000Z');
    const sinPiloto = await api.jsonComo('rosa', '/vuelos', { ...vuelo, pilotoId: 2 });
    assert.equal(sinPiloto.cuerpo.errores[0].campo, 'pilotoId');

    await api.jsonComo('diego', '/saltos', { vueloId: 2, tipo: 'libre' });
    const clima = await api.jsonComo('rosa', '/clima', { suspendido: true, motivo: 'viento de 30 nudos' }, 'PUT');
    assert.equal(clima.cuerpo.data.suspendido, true);
    assert.equal((await api.jsonComo('diego', '/saltos', { vueloId: 3, tipo: 'libre' })).cuerpo.contexto.motivo, 'los saltos estan suspendidos por clima');
    assert.equal((await api.jsonComo('rosa', '/saltos/1/resolucion', { decision: 'aprobar' })).status, 403);
    assert.equal((await api.como('ana', '/vuelos/2/despegue', { method: 'POST' })).status, 403);
    assert.equal((await api.jsonComo('diego', '/clima', { suspendido: false }, 'PUT')).status, 403);
    await api.jsonComo('rosa', '/clima', { suspendido: false }, 'PUT');
    assert.equal((await api.jsonComo('rosa', '/saltos/1/resolucion', { decision: 'aprobar' })).status, 200);
    assert.equal((await api.jsonComo('rosa', '/clima', { suspendido: 'no' }, 'PUT')).status, 400);
  }));
});

describe('explicar decisiones', () => {
  it('responde si una accion esta permitida y por que', () => conApi(async (api) => {
    await api.jsonComo('sofia', '/saltos', { vueloId: 1, tipo: 'tandem' });
    const admin = await api.jsonComo('elena', '/autorizacion/explicar', { accion: 'saltos:aprobar', saltoId: 1 });
    assert.deepEqual(admin.cuerpo.data, {
      accion: 'saltos:aprobar',
      usuarioId: 7,
      permitido: false,
      motivo: 'aprobar saltos exige la certificacion de instructor',
      etapa: 'condicion',
      otorgadoPor: ['admin'],
    });
    const wingsuit = await api.jsonComo('ana', '/autorizacion/explicar', { accion: 'saltos:crear', tipo: 'wingsuit' });
    assert.equal(wingsuit.cuerpo.data.permitido, true);
    assert.deepEqual(wingsuit.cuerpo.data.otorgadoPor, ['paracaidista']);
    const malo = await api.jsonComo('ana', '/autorizacion/explicar', { accion: 'todo', saltoId: 0 });
    assert.equal(malo.cuerpo.errores.length, 2);
    assert.equal((await api.jsonComo('ana', '/autorizacion/explicar', { accion: 'saltos:ver', saltoId: 99 })).status, 404);
  }));
});
