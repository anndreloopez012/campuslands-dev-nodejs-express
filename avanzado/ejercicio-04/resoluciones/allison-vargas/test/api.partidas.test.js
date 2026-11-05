import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';

const nueva = (api, datos = { nombre: 'Isla de prueba', capacidad: 4 }) => api.json('/partidas', datos);

async function partidaConJugadores(api, ids, datos) {
  const { cuerpo } = await nueva(api, datos);
  const id = cuerpo.data.id;
  for (const jugadorId of ids) await api.json(`/partidas/${id}/unirse`, { jugadorId });
  return id;
}

describe('API de partidas', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  it('lista la partida inicial y filtra por estado', async () => {
    const todas = await api.pedir('/partidas');
    assert.equal(todas.cuerpo.data.length, 1);
    assert.equal(todas.cuerpo.data[0].nombre, 'Isla Norte');
    const abiertas = await api.pedir('/partidas?estado=abierta');
    assert.equal(abiertas.cuerpo.paginacion.total, 1);
    const terminadas = await api.pedir('/partidas?estado=terminada');
    assert.equal(terminadas.cuerpo.paginacion.total, 0);
    const mala = await api.pedir('/partidas?estado=pausada');
    assert.equal(mala.status, 400);
  });

  it('crea partidas con valores por defecto', async () => {
    const { status, cuerpo, cabeceras } = await nueva(api, { nombre: 'Desierto' });
    assert.equal(status, 201);
    assert.equal(cuerpo.data.capacidad, 10);
    assert.equal(cuerpo.data.minimo, 2);
    assert.equal(cuerpo.data.estado, 'abierta');
    assert.equal(cabeceras.get('location'), `/avanzado/ejercicio-04/partidas/${cuerpo.data.id}`);
  });

  it('valida la creacion y devuelve todos los errores', async () => {
    const { status, cuerpo } = await nueva(api, { nombre: 'x', capacidad: 99, minimo: 1.5 });
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores.map((e) => e.campo), ['nombre', 'capacidad', 'minimo']);
    const cruzada = await nueva(api, { nombre: 'Valida', capacidad: 3, minimo: 5 });
    assert.deepEqual(cruzada.cuerpo.errores, [{ campo: 'minimo', mensaje: 'no puede superar la capacidad' }]);
  });

  it('responde 404 para una partida inexistente', async () => {
    const { status, cuerpo } = await api.pedir('/partidas/77');
    assert.equal(status, 404);
    assert.equal(cuerpo.codigo, 'PARTIDA_NO_ENCONTRADA');
    assert.deepEqual(cuerpo.contexto, { partidaId: 77 });
  });

  it('une jugadores y muestra el detalle', async () => {
    const { status, cuerpo } = await api.json('/partidas/1/unirse', { jugadorId: 1 });
    assert.equal(status, 200);
    assert.equal(cuerpo.data.inscritos, 1);
    assert.equal(cuerpo.data.jugadores[0].nick, 'Valkyrie');
  });

  it('distingue jugador inexistente, suspendido y repetido', async () => {
    const inexistente = await api.json('/partidas/1/unirse', { jugadorId: 55 });
    assert.equal(inexistente.status, 404);
    assert.equal(inexistente.cuerpo.codigo, 'JUGADOR_NO_ENCONTRADO');
    const suspendido = await api.json('/partidas/1/unirse', { jugadorId: 8 });
    assert.equal(suspendido.status, 403);
    assert.equal(suspendido.cuerpo.codigo, 'JUGADOR_SUSPENDIDO');
    await api.json('/partidas/1/unirse', { jugadorId: 1 });
    const repetido = await api.json('/partidas/1/unirse', { jugadorId: 1 });
    assert.equal(repetido.status, 409);
    assert.equal(repetido.cuerpo.codigo, 'JUGADOR_YA_INSCRITO');
  });

  it('un jugador no puede estar en dos partidas activas', async () => {
    await api.json('/partidas/1/unirse', { jugadorId: 1 });
    const otra = (await nueva(api)).cuerpo.data.id;
    const { status, cuerpo } = await api.json(`/partidas/${otra}/unirse`, { jugadorId: 1 });
    assert.equal(status, 409);
    assert.equal(cuerpo.codigo, 'JUGADOR_EN_OTRA_PARTIDA');
    assert.deepEqual(cuerpo.contexto, { jugadorId: 1, partidaId: 1 });
  });

  it('rechaza cuando se llena', async () => {
    const id = await partidaConJugadores(api, [1, 2], { nombre: 'Chica', capacidad: 2 });
    const { status, cuerpo } = await api.json(`/partidas/${id}/unirse`, { jugadorId: 3 });
    assert.equal(status, 409);
    assert.equal(cuerpo.codigo, 'PARTIDA_LLENA');
    assert.deepEqual(cuerpo.contexto, { inscritos: 2, capacidad: 2 });
  });

  it('permite salir y volver a entrar a otra partida', async () => {
    await api.json('/partidas/1/unirse', { jugadorId: 1 });
    const salida = await api.json('/partidas/1/salir', { jugadorId: 1 });
    assert.equal(salida.cuerpo.data.inscritos, 0);
    const otra = (await nueva(api)).cuerpo.data.id;
    const union = await api.json(`/partidas/${otra}/unirse`, { jugadorId: 1 });
    assert.equal(union.status, 200);
    const fuera = await api.json('/partidas/1/salir', { jugadorId: 4 });
    assert.equal(fuera.status, 403);
    assert.equal(fuera.cuerpo.codigo, 'JUGADOR_NO_PARTICIPA');
  });

  it('no inicia sin el minimo de jugadores', async () => {
    await api.json('/partidas/1/unirse', { jugadorId: 1 });
    const { status, cuerpo } = await api.pedir('/partidas/1/iniciar', { method: 'POST' });
    assert.equal(status, 422);
    assert.equal(cuerpo.codigo, 'JUGADORES_INSUFICIENTES');
    assert.deepEqual(cuerpo.contexto, { minimo: 2, inscritos: 1, faltan: 1 });
  });

  it('las acciones de juego fallan antes de iniciar', async () => {
    await api.json('/partidas/1/unirse', { jugadorId: 1 });
    const { status, cuerpo } = await api.json('/partidas/1/mover', { jugadorId: 1, x: 5, y: 5 });
    assert.equal(status, 409);
    assert.equal(cuerpo.codigo, 'PARTIDA_NO_EN_CURSO');
  });

  it('juega una partida completa hasta que hay ganador', async () => {
    const id = await partidaConJugadores(api, [1, 2]);
    const inicio = await api.pedir(`/partidas/${id}/iniciar`, { method: 'POST' });
    assert.equal(inicio.cuerpo.data.estado, 'en_curso');

    const lejos = await api.json(`/partidas/${id}/recoger`, { jugadorId: 2, objetoId: 2 });
    assert.equal(lejos.status, 422);
    assert.equal(lejos.cuerpo.codigo, 'OBJETO_LEJOS');

    const recoge = await api.json(`/partidas/${id}/recoger`, { jugadorId: 1, objetoId: 2 });
    assert.deepEqual(recoge.cuerpo.data.inventario, ['rifle']);

    let ultimo;
    for (let i = 0; i < 4; i += 1) ultimo = await api.json(`/partidas/${id}/disparar`, { atacanteId: 1, objetivoId: 2 });
    assert.equal(ultimo.cuerpo.data.eliminado, true);
    assert.equal(ultimo.cuerpo.data.ganadorId, 1);

    const detalle = await api.pedir(`/partidas/${id}`);
    assert.equal(detalle.cuerpo.data.estado, 'terminada');
    assert.equal(detalle.cuerpo.data.ganadorId, 1);

    const tarde = await api.json(`/partidas/${id}/curar`, { jugadorId: 1 });
    assert.equal(tarde.status, 409);
    assert.equal(tarde.cuerpo.codigo, 'PARTIDA_TERMINADA');
    assert.deepEqual(tarde.cuerpo.contexto, { ganadorId: 1 });

    const eventos = await api.pedir(`/partidas/${id}/eventos`);
    assert.equal(eventos.cuerpo.data.at(-1).tipo, 'fin');
  });

  it('el ganador deja libre a los jugadores para otra partida', async () => {
    const id = await partidaConJugadores(api, [1, 2]);
    await api.pedir(`/partidas/${id}/iniciar`, { method: 'POST' });
    await api.json(`/partidas/${id}/recoger`, { jugadorId: 1, objetoId: 2 });
    for (let i = 0; i < 4; i += 1) await api.json(`/partidas/${id}/disparar`, { atacanteId: 1, objetivoId: 2 });
    const otra = (await nueva(api)).cuerpo.data.id;
    const { status } = await api.json(`/partidas/${otra}/unirse`, { jugadorId: 1 });
    assert.equal(status, 200);
  });

  it('avanza la zona y reporta el dano', async () => {
    const id = await partidaConJugadores(api, [1, 2, 3, 4]);
    await api.pedir(`/partidas/${id}/iniciar`, { method: 'POST' });
    const { status, cuerpo } = await api.pedir(`/partidas/${id}/zona/avanzar`, { method: 'POST' });
    assert.equal(status, 200);
    assert.equal(cuerpo.data.zona.radio, 35);
    assert.deepEqual(cuerpo.data.afectados, [{ jugadorId: 4, vida: 90 }]);
    for (let i = 0; i < 3; i += 1) await api.pedir(`/partidas/${id}/zona/avanzar`, { method: 'POST' });
    const final = await api.pedir(`/partidas/${id}/zona/avanzar`, { method: 'POST' });
    assert.equal(final.status, 409);
    assert.equal(final.cuerpo.codigo, 'ZONA_FINAL');
  });

  it('valida el cuerpo de cada accion', async () => {
    const id = await partidaConJugadores(api, [1, 2]);
    await api.pedir(`/partidas/${id}/iniciar`, { method: 'POST' });
    const mover = await api.json(`/partidas/${id}/mover`, { jugadorId: 1, x: 'a' });
    assert.deepEqual(mover.cuerpo.errores, [
      { campo: 'x', mensaje: 'debe ser un numero' },
      { campo: 'y', mensaje: 'es obligatorio' },
    ]);
    const disparar = await api.json(`/partidas/${id}/disparar`, { atacanteId: 1, objetivoId: 2, arma: 'bazuca' });
    assert.match(disparar.cuerpo.errores[0].mensaje, /pistola, rifle/);
    const vacio = await api.json(`/partidas/${id}/curar`, {});
    assert.deepEqual(vacio.cuerpo.errores, [{ campo: 'jugadorId', mensaje: 'es obligatorio' }]);
  });

  it('informa metodos permitidos en las rutas de accion', async () => {
    const { status, cabeceras } = await api.pedir('/partidas/1/mover');
    assert.equal(status, 405);
    assert.equal(cabeceras.get('allow'), 'POST');
  });
});
