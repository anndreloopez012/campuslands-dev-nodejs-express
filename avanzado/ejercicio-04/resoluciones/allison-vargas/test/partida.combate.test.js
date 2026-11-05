import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lanzaDominio, partidaIniciada } from '../soporte/dominio.js';

const armada = (opciones) => {
  const partida = partidaIniciada(opciones);
  partida.recoger(1, 1);
  return partida;
};

describe('disparar', () => {
  it('sin arma no se puede disparar', () => {
    const partida = partidaIniciada();
    assert.throws(() => partida.disparar(1, 2), lanzaDominio('SIN_ARMA', { jugadorId: 1 }));
  });

  it('no permite dispararse a si mismo', () => {
    const partida = armada();
    assert.throws(() => partida.disparar(1, 1), lanzaDominio('AUTO_ATAQUE'));
  });

  it('rechaza objetivos que no participan', () => {
    const partida = armada();
    assert.throws(() => partida.disparar(1, 9), lanzaDominio('JUGADOR_NO_PARTICIPA', { jugadorId: 9 }));
  });

  it('quita vida, gasta una bala y reporta el resultado', () => {
    const partida = armada();
    const resultado = partida.disparar(1, 2);
    assert.equal(resultado.arma, 'pistola');
    assert.equal(resultado.dano, 20);
    assert.equal(resultado.objetivo.vida, 80);
    assert.equal(resultado.eliminado, false);
    assert.equal(partida.aJSON({ detalle: true }).jugadores[0].municion, 5);
  });

  it('el escudo absorbe primero y el sobrante pasa a la vida', () => {
    const partida = partidaIniciada();
    partida.recoger(1, 2);
    partida.mover(2, { x: 52, y: 50 });
    partida.recoger(2, 5);
    const resultado = partida.disparar(1, 2);
    assert.equal(resultado.dano, 30);
    assert.equal(resultado.objetivo.escudo, 0);
    assert.equal(resultado.objetivo.vida, 95);
  });

  it('usa por defecto el arma de mayor dano y permite elegir otra', () => {
    const partida = partidaIniciada();
    partida.recoger(1, 1);
    partida.recoger(1, 2);
    assert.equal(partida.disparar(1, 2).arma, 'rifle');
    assert.equal(partida.disparar(1, 2, 'pistola').arma, 'pistola');
  });

  it('rechaza un arma que no se tiene', () => {
    const partida = armada();
    assert.throws(
      () => partida.disparar(1, 2, 'rifle'),
      lanzaDominio('ARMA_NO_EQUIPADA', { jugadorId: 1, arma: 'rifle' }),
    );
  });

  it('rechaza disparar sin municion', () => {
    const partida = armada({ jugadores: 3 });
    for (let i = 0; i < 3; i += 1) partida.disparar(1, 2);
    for (let i = 0; i < 3; i += 1) partida.disparar(1, 3);
    assert.throws(() => partida.disparar(1, 2), lanzaDominio('SIN_MUNICION', { jugadorId: 1 }));
  });

  it('rechaza objetivos fuera del alcance del arma y acepta con una mejor', () => {
    const partida = armada({ jugadores: 4 });
    assert.throws(
      () => partida.disparar(1, 4),
      lanzaDominio('FUERA_DE_ALCANCE', { distancia: 56.57, alcance: 30, arma: 'pistola' }),
    );
    partida.recoger(1, 2);
    assert.equal(partida.disparar(1, 4).arma, 'rifle');
  });

  it('eliminar a un rival registra puesto y sigue la partida si quedan varios', () => {
    const partida = partidaIniciada({ jugadores: 3 });
    partida.recoger(1, 2);
    const resultados = [1, 2, 3, 4].map(() => partida.disparar(1, 2));
    assert.equal(resultados[3].eliminado, true);
    const detalle = partida.aJSON({ detalle: true });
    assert.equal(detalle.estado, 'en_curso');
    assert.equal(detalle.jugadores[1].puesto, 3);
    assert.equal(detalle.jugadores[1].eliminadoPor, 1);
    assert.equal(detalle.jugadores[0].eliminaciones, 1);
    assert.throws(() => partida.disparar(1, 2), lanzaDominio('OBJETIVO_ELIMINADO', { objetivoId: 2 }));
    assert.throws(() => partida.mover(2, { x: 55, y: 51 }), lanzaDominio('JUGADOR_ELIMINADO', { jugadorId: 2 }));
  });

  it('el ultimo jugador en pie gana y la partida se cierra', () => {
    const partida = partidaIniciada();
    partida.recoger(1, 2);
    for (let i = 0; i < 4; i += 1) partida.disparar(1, 2);
    assert.equal(partida.estado, 'terminada');
    assert.equal(partida.ganadorId, 1);
    assert.throws(() => partida.mover(1, { x: 51, y: 50 }), lanzaDominio('PARTIDA_TERMINADA', { ganadorId: 1 }));
    assert.throws(() => partida.avanzarZona(), lanzaDominio('PARTIDA_TERMINADA'));
  });

  it('el registro de eventos cuenta lo ocurrido en orden', () => {
    const partida = partidaIniciada();
    partida.recoger(1, 2);
    for (let i = 0; i < 4; i += 1) partida.disparar(1, 2);
    const tipos = partida.eventos().map((evento) => evento.tipo);
    assert.deepEqual(tipos, ['unirse', 'unirse', 'iniciar', 'recoger', 'disparar', 'disparar', 'disparar', 'disparar', 'eliminacion', 'fin']);
    assert.deepEqual(partida.eventos().map((evento) => evento.n), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

describe('curar', () => {
  it('usa un botiquin, sube la vida sin pasar del maximo y lo consume', () => {
    const partida = partidaIniciada();
    partida.recoger(1, 3);
    partida.mover(2, { x: 52, y: 50 });
    partida.recoger(2, 1);
    partida.disparar(2, 1);
    const resumen = partida.curar(1);
    assert.equal(resumen.vida, 100);
    assert.deepEqual(resumen.inventario, []);
  });

  it('rechaza curar sin botiquines', () => {
    const partida = partidaIniciada();
    assert.throws(() => partida.curar(1), lanzaDominio('SIN_BOTIQUIN', { jugadorId: 1 }));
  });

  it('rechaza curar con la vida completa y conserva el botiquin', () => {
    const partida = partidaIniciada();
    partida.recoger(1, 3);
    assert.throws(() => partida.curar(1), lanzaDominio('VIDA_COMPLETA', { vidaMaxima: 100 }));
    assert.deepEqual(partida.aJSON({ detalle: true }).jugadores[0].inventario, ['botiquin']);
  });
});

describe('zona', () => {
  const lejos = () => [{ x: 50, y: 50 }, { x: 95, y: 95 }];

  it('al avanzar reduce el radio y hace dano a quien queda fuera', () => {
    const partida = partidaIniciada({ aparicion: lejos });
    const resultado = partida.avanzarZona();
    assert.equal(resultado.zona.fase, 2);
    assert.equal(resultado.zona.radio, 35);
    assert.equal(resultado.dano, 10);
    assert.deepEqual(resultado.afectados, [{ jugadorId: 2, vida: 90 }]);
  });

  it('el dano crece en cada fase y elimina a quien no entra a tiempo', () => {
    const partida = partidaIniciada({ jugadores: 2, aparicion: lejos });
    partida.avanzarZona();
    partida.avanzarZona();
    const tercera = partida.avanzarZona();
    assert.equal(tercera.dano, 30);
    assert.equal(partida.aJSON({ detalle: true }).jugadores[1].vida, 40);
    const cuarta = partida.avanzarZona();
    assert.equal(cuarta.ganadorId, 1);
    const eliminado = partida.aJSON({ detalle: true }).jugadores[1];
    assert.equal(eliminado.vivo, false);
    assert.equal(eliminado.eliminadoPor, 'zona');
    assert.equal(partida.estado, 'terminada');
  });

  it('dentro de la zona nadie recibe dano', () => {
    const partida = partidaIniciada({ aparicion: () => [{ x: 50, y: 50 }, { x: 52, y: 50 }] });
    for (let i = 0; i < 4; i += 1) assert.deepEqual(partida.avanzarZona().afectados, []);
    assert.throws(() => partida.avanzarZona(), lanzaDominio('ZONA_FINAL', { fase: 5 }));
  });

  it('un jugador puede volver a entrar a la zona moviendose', () => {
    const partida = partidaIniciada({ aparicion: () => [{ x: 50, y: 50 }, { x: 75, y: 50 }] });
    partida.avanzarZona();
    partida.avanzarZona();
    assert.equal(partida.mover(2, { x: 60, y: 50 }).dentroDeLaZona, true);
    assert.equal(partida.mover(2, { x: 75, y: 50 }).dentroDeLaZona, false);
  });
});
