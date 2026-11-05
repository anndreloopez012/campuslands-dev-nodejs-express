import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearPartida, lanzaDominio, partidaIniciada } from '../soporte/dominio.js';
import { jugador } from '../soporte/datos.js';

describe('inscripcion', () => {
  it('une jugadores a una partida abierta', () => {
    const partida = crearPartida();
    partida.unirse(jugador(1));
    partida.unirse(jugador(2));
    assert.equal(partida.aJSON().inscritos, 2);
    assert.equal(partida.aJSON().estado, 'abierta');
  });

  it('rechaza a un jugador suspendido', () => {
    const partida = crearPartida();
    assert.throws(() => partida.unirse(jugador(1, { suspendido: true })), lanzaDominio('JUGADOR_SUSPENDIDO', { jugadorId: 1 }));
    assert.equal(partida.aJSON().inscritos, 0);
  });

  it('rechaza inscribir dos veces al mismo jugador', () => {
    const partida = crearPartida();
    partida.unirse(jugador(1));
    assert.throws(() => partida.unirse(jugador(1)), lanzaDominio('JUGADOR_YA_INSCRITO', { jugadorId: 1, partidaId: 1 }));
  });

  it('rechaza a quien ya juega en otra partida', () => {
    const partida = crearPartida();
    assert.throws(
      () => partida.unirse(jugador(1), { partidaActivaId: 7 }),
      lanzaDominio('JUGADOR_EN_OTRA_PARTIDA', { jugadorId: 1, partidaId: 7 }),
    );
  });

  it('rechaza cuando la partida esta llena y explica los numeros', () => {
    const partida = crearPartida({ capacidad: 2 });
    partida.unirse(jugador(1));
    partida.unirse(jugador(2));
    assert.throws(() => partida.unirse(jugador(3)), lanzaDominio('PARTIDA_LLENA', { inscritos: 2, capacidad: 2 }));
  });

  it('permite salir mientras esta abierta y libera el cupo', () => {
    const partida = crearPartida({ capacidad: 2 });
    partida.unirse(jugador(1));
    partida.unirse(jugador(2));
    partida.salir(1);
    partida.unirse(jugador(3));
    assert.equal(partida.aJSON().inscritos, 2);
  });

  it('no deja salir a quien no participa', () => {
    const partida = crearPartida();
    assert.throws(() => partida.salir(5), lanzaDominio('JUGADOR_NO_PARTICIPA', { jugadorId: 5, partidaId: 1 }));
  });

  it('no deja unirse ni salir cuando ya inicio', () => {
    const partida = partidaIniciada();
    assert.throws(() => partida.unirse(jugador(3)), lanzaDominio('PARTIDA_NO_ABIERTA', { estado: 'en_curso' }));
    assert.throws(() => partida.salir(1), lanzaDominio('PARTIDA_NO_ABIERTA', { estado: 'en_curso' }));
  });
});

describe('inicio', () => {
  it('exige el minimo de jugadores e indica cuantos faltan', () => {
    const partida = crearPartida({ minimo: 3 });
    partida.unirse(jugador(1));
    assert.throws(
      () => partida.iniciar(),
      lanzaDominio('JUGADORES_INSUFICIENTES', { minimo: 3, inscritos: 1, faltan: 2 }),
    );
    assert.equal(partida.estado, 'abierta');
  });

  it('coloca a los jugadores, reparte el botin y cambia de estado', () => {
    const partida = partidaIniciada({ jugadores: 3 });
    const detalle = partida.aJSON({ detalle: true });
    assert.equal(detalle.estado, 'en_curso');
    assert.deepEqual(detalle.jugadores.map((j) => [j.x, j.y]), [[50, 50], [55, 50], [60, 50]]);
    assert.equal(detalle.loot.length, 9);
    assert.ok(detalle.loot.every((objeto) => objeto.recogidoPor === null));
  });

  it('no se puede iniciar dos veces', () => {
    const partida = partidaIniciada();
    assert.throws(() => partida.iniciar(), lanzaDominio('PARTIDA_NO_ABIERTA'));
  });

  it('las acciones de juego fallan antes de iniciar', () => {
    const partida = crearPartida();
    partida.unirse(jugador(1));
    assert.throws(() => partida.mover(1, { x: 1, y: 1 }), lanzaDominio('PARTIDA_NO_EN_CURSO'));
    assert.throws(() => partida.avanzarZona(), lanzaDominio('PARTIDA_NO_EN_CURSO'));
  });
});
