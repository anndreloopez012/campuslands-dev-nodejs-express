import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi, AHORA } from '../soporte/api.js';
import { draftValido } from '../soporte/datos.js';

describe('API de drafts', () => {
  let api;

  beforeEach(async () => {
    api = await levantarApi();
  });

  afterEach(() => api.cerrar());

  it('crea un draft y resume baneos y picks por equipo', async () => {
    const { status, cabeceras, cuerpo } = await api.json('/drafts', draftValido());
    assert.equal(status, 201);
    assert.equal(cabeceras.get('location'), '/avanzado/ejercicio-03/drafts/1');
    assert.equal(cuerpo.data.estado, 'borrador');
    assert.equal(cuerpo.data.programadaPara, '2026-12-01T18:30:00.000Z');
    assert.equal(cuerpo.data.creadoEn, AHORA.toISOString());
    assert.deepEqual(cuerpo.data.resumen, {
      baneos: { azul: [4], rojo: [3] },
      picks: {
        azul: [{ heroe: 1, jugador: 'cazador' }],
        rojo: [{ heroe: 2, jugador: 'Solaris' }],
      },
    });
  });

  it('reune todas las referencias inexistentes en un solo 422', async () => {
    const acciones = [
      { tipo: 'ban', equipo: 'azul', heroe: 99 },
      { tipo: 'pick', equipo: 'azul', heroe: 1, jugador: 'Solaris' },
      { tipo: 'pick', equipo: 'rojo', heroe: 2, jugador: 'Solaris' },
    ];
    const { status, cuerpo } = await api.json('/drafts', draftValido({ azul: 1, rojo: 3, acciones }));
    assert.equal(status, 422);
    assert.equal(cuerpo.codigo, 'REFERENCIA_INVALIDA');
    assert.deepEqual(cuerpo.errores.map((e) => `${e.ruta}|${e.mensaje}`), [
      'acciones[0].heroe|No existe el heroe 99',
      'acciones[1].jugador|Solaris no pertenece al equipo azul',
      'acciones[2].jugador|Solaris no pertenece al equipo rojo',
    ]);
  });

  it('informa los equipos que no existen', async () => {
    const { status, cuerpo } = await api.json('/drafts', draftValido({ azul: 50, rojo: 60 }));
    assert.equal(status, 422);
    assert.deepEqual(cuerpo.errores.map((e) => `${e.ruta}|${e.mensaje}`), [
      'azul|No existe el equipo 50',
      'rojo|No existe el equipo 60',
    ]);
  });

  it('las reglas del schema se aplican antes de buscar referencias', async () => {
    const acciones = [
      { tipo: 'ban', equipo: 'azul', heroe: 99 },
      { tipo: 'ban', equipo: 'rojo', heroe: 99 },
    ];
    const { status, cuerpo } = await api.json('/drafts', draftValido({ azul: 1, rojo: 1, acciones }));
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores.map((e) => `${e.ruta}:${e.codigo}`), [
      'rojo:equipos_iguales',
      'acciones[1].heroe:heroe_repetido',
    ]);
  });

  it('los errores de una accion indican su posicion', async () => {
    const acciones = [
      { tipo: 'ban', equipo: 'azul', heroe: 4 },
      { tipo: 'pick', equipo: 'rojo', heroe: 'dos', jugador: 'Solaris' },
      { tipo: 'cambio' },
    ];
    const { cuerpo } = await api.json('/drafts', draftValido({ acciones }));
    assert.deepEqual(cuerpo.errores.map((e) => `${e.en}:${e.ruta}:${e.codigo}`), [
      'cuerpo:acciones[1].heroe:tipo_invalido',
      'cuerpo:acciones[2].tipo:enum_invalido',
    ]);
  });

  it('lista, filtra por equipo y ordena', async () => {
    await api.json('/drafts', draftValido({ azul: 1, rojo: 2 }));
    await api.json('/drafts', draftValido({ azul: 2, rojo: 3, acciones: [{ tipo: 'ban', equipo: 'azul', heroe: 1 }] }));
    await api.json('/drafts', draftValido({ azul: 3, rojo: 1, acciones: [{ tipo: 'ban', equipo: 'rojo', heroe: 1 }] }));
    const ids = async (consulta) => (await api.pedir(`/drafts${consulta}`)).cuerpo.data.map((d) => d.id);
    assert.deepEqual(await ids(''), [1, 2, 3]);
    assert.deepEqual(await ids('?equipoId=1'), [1, 3]);
    assert.deepEqual(await ids('?equipoId=3&orden=id_desc'), [3, 2]);
    assert.deepEqual(await ids('?limite=2&pagina=2'), [3]);
    assert.equal((await api.pedir('/drafts?equipoId=abc')).status, 400);
    assert.equal((await api.pedir('/drafts?orden=fecha')).status, 400);
  });

  it('consulta un draft y responde 404, 400 y 405', async () => {
    await api.json('/drafts', draftValido());
    assert.equal((await api.pedir('/drafts/1')).cuerpo.data.azul, 1);
    assert.equal((await api.pedir('/drafts/7')).cuerpo.codigo, 'DRAFT_NO_ENCONTRADO');
    assert.equal((await api.pedir('/drafts/x')).status, 400);
    const metodo = await api.pedir('/drafts/1', { method: 'DELETE' });
    assert.deepEqual([metodo.status, metodo.cabeceras.get('allow')], [405, 'GET']);
  });
});
