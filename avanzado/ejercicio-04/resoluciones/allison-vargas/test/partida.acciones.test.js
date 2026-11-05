import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lanzaDominio, partidaIniciada } from '../soporte/dominio.js';

describe('mover', () => {
  it('actualiza la posicion e indica si sigue dentro de la zona', () => {
    const partida = partidaIniciada();
    assert.deepEqual(partida.mover(1, { x: 55, y: 60 }), { x: 55, y: 60, dentroDeLaZona: true });
  });

  it('rechaza posiciones fuera del mapa', () => {
    const partida = partidaIniciada();
    partida.mover(1, { x: 60, y: 50 });
    assert.throws(() => partida.mover(1, { x: 101, y: 50 }), lanzaDominio('FUERA_DE_MAPA', { x: 101, ancho: 100 }));
    assert.throws(() => partida.mover(1, { x: 50, y: -1 }), lanzaDominio('FUERA_DE_MAPA'));
  });

  it('rechaza pasos mayores al maximo con la distancia real', () => {
    const partida = partidaIniciada();
    assert.throws(
      () => partida.mover(1, { x: 50, y: 70 }),
      lanzaDominio('MOVIMIENTO_DEMASIADO_LARGO', { distancia: 20, maximo: 15 }),
    );
    assert.deepEqual(partida.aJSON({ detalle: true }).jugadores[0].x, 50);
  });

  it('rechaza a quien no participa', () => {
    const partida = partidaIniciada();
    assert.throws(() => partida.mover(9, { x: 50, y: 50 }), lanzaDominio('JUGADOR_NO_PARTICIPA', { jugadorId: 9 }));
  });
});

describe('recoger', () => {
  it('agrega armas y botiquines al inventario y marca el objeto', () => {
    const partida = partidaIniciada();
    partida.recoger(1, 1);
    const resumen = partida.recoger(1, 3);
    assert.deepEqual(resumen.inventario, ['pistola', 'botiquin']);
    assert.equal(partida.aJSON({ detalle: true }).loot[0].recogidoPor, 1);
  });

  it('el escudo y la municion se aplican sin ocupar espacio', () => {
    const partida = partidaIniciada();
    partida.recoger(1, 5);
    const resumen = partida.recoger(1, 6);
    assert.equal(resumen.escudo, 25);
    assert.equal(resumen.municion, 18);
    assert.deepEqual(resumen.inventario, []);
  });

  it('rechaza objetos inexistentes', () => {
    const partida = partidaIniciada();
    assert.throws(() => partida.recoger(1, 99), lanzaDominio('OBJETO_NO_ENCONTRADO', { objetoId: 99 }));
  });

  it('rechaza objetos lejanos', () => {
    const partida = partidaIniciada();
    assert.throws(() => partida.recoger(1, 9), lanzaDominio('OBJETO_LEJOS', { alcance: 3 }));
  });

  it('rechaza objetos que ya tomo otro jugador', () => {
    const partida = partidaIniciada();
    partida.recoger(1, 1);
    partida.mover(2, { x: 51, y: 50 });
    assert.throws(() => partida.recoger(2, 1), lanzaDominio('OBJETO_YA_RECOGIDO', { objetoId: 1, recogidoPor: 1 }));
  });

  it('rechaza una segunda arma del mismo tipo', () => {
    const partida = partidaIniciada({ plantillaLoot: [
      { id: 1, tipo: 'pistola', x: 50, y: 50 },
      { id: 2, tipo: 'pistola', x: 50, y: 51 },
    ] });
    partida.recoger(1, 1);
    assert.throws(() => partida.recoger(1, 2), lanzaDominio('ARMA_REPETIDA', { arma: 'pistola' }));
  });

  it('rechaza cuando el inventario esta lleno y no consume el objeto', () => {
    const partida = partidaIniciada();
    for (const id of [1, 2, 3, 4]) partida.recoger(1, id);
    assert.throws(() => partida.recoger(1, 7), lanzaDominio('INVENTARIO_LLENO', { ocupados: 4, espacios: 4 }));
    assert.equal(partida.aJSON({ detalle: true }).loot[6].recogidoPor, null);
  });

  it('rechaza escudo y municion cuando ya estan al maximo', () => {
    const partida = partidaIniciada({ plantillaLoot: [
      { id: 1, tipo: 'escudo', x: 50, y: 50 },
      { id: 2, tipo: 'escudo', x: 50, y: 50 },
      { id: 3, tipo: 'escudo', x: 50, y: 50 },
      { id: 4, tipo: 'municion', x: 50, y: 50 },
    ] });
    partida.recoger(1, 1);
    partida.recoger(1, 2);
    assert.throws(() => partida.recoger(1, 3), lanzaDominio('ESCUDO_COMPLETO', { escudoMaximo: 50 }));
    const lleno = partidaIniciada({ plantillaLoot: Array.from({ length: 6 }, (_, i) => ({ id: i + 1, tipo: 'municion', x: 50, y: 50 })) });
    for (let id = 1; id <= 4; id += 1) lleno.recoger(1, id);
    lleno.recoger(1, 5);
    assert.throws(() => lleno.recoger(1, 6), lanzaDominio('MUNICION_LLENA', { municionMaxima: 60 }));
  });
});
