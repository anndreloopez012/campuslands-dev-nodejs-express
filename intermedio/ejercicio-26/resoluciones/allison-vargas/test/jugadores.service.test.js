import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { crearJugadoresService } from '../src/services/jugadores.service.js';
import { MemoryRepository } from '../src/repositories/memory.repository.js';

const semilla = [
  { id: 1, nick: 'Ana', region: 'na', elo: 1000, partidas: 2, victorias: 1, creadoEn: '2026-10-01T00:00:00.000Z' },
  { id: 2, nick: 'Beto', region: 'eu', elo: 5, partidas: 0, victorias: 0, creadoEn: '2026-10-01T00:00:00.000Z' },
];

const crear = () => {
  const reloj = mock.fn(() => new Date('2026-11-01T10:00:00.000Z'));
  return { servicio: crearJugadoresService({ repositorio: new MemoryRepository(semilla), reloj }), reloj };
};

describe('servicio de jugadores', () => {
  it('crea un jugador con elo inicial y la fecha del reloj', () => {
    const { servicio, reloj } = crear();
    const jugador = servicio.crear({ nick: 'Cami_9', region: 'asia' });
    assert.equal(jugador.id, 3);
    assert.equal(jugador.elo, 1000);
    assert.equal(jugador.creadoEn, '2026-11-01T10:00:00.000Z');
    assert.equal(reloj.mock.callCount(), 1);
  });

  it('rechaza nicks con caracteres raros o repetidos', () => {
    const { servicio } = crear();
    assert.throws(() => servicio.crear({ nick: 'a b!', region: 'na' }), (e) => e.statusCode === 400);
    assert.throws(() => servicio.crear({ nick: 'ANA', region: 'na' }), (e) => e.codigo === 'NICK_DUPLICADO');
  });

  it('registra un resultado y no deja el elo por debajo de cero', () => {
    const { servicio } = crear();
    const perdedor = servicio.registrarResultado(2, { delta: -16, gano: false });
    assert.equal(perdedor.elo, 0);
    assert.equal(perdedor.partidas, 1);
    assert.equal(perdedor.victorias, 0);

    const ganador = servicio.registrarResultado(1, { delta: 16, gano: true });
    assert.equal(ganador.elo, 1016);
    assert.equal(ganador.victorias, 2);
  });

  it('buscar devuelve null y obtener lanza 404', () => {
    const { servicio } = crear();
    assert.equal(servicio.buscar(99), null);
    assert.throws(() => servicio.obtener(99), (e) => e.statusCode === 404 && e.codigo === 'JUGADOR_NO_ENCONTRADO');
  });
});
