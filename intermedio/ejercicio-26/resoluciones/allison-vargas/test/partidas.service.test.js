import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { crearPartidasService } from '../src/services/partidas.service.js';
import { DependenciaError } from '../src/utils/errors.js';

const base = {
  1: { id: 1, nick: 'Uno', elo: 1500 },
  2: { id: 2, nick: 'Dos', elo: 1500 },
};

function crearEntorno() {
  const registro = [];

  const jugadores = {
    buscar: mock.fn((id) => base[id] ?? null),
    registrarResultado: mock.fn((id, { delta }) => {
      registro.push(['resultado', id]);
      return { ...base[id], elo: base[id].elo + delta };
    }),
  };
  const anticheat = {
    verificar: mock.fn(async (nick) => {
      registro.push(['anticheat', nick]);
      return { limpio: true };
    }),
  };
  const notificador = {
    enviar: mock.fn(async () => {
      registro.push(['notificar']);
    }),
  };
  const repositorio = {
    crear: mock.fn((datos) => {
      registro.push(['guardar']);
      return { id: 1, ...datos };
    }),
  };
  const reloj = mock.fn(() => new Date('2026-11-01T10:00:00.000Z'));
  const generarCodigo = mock.fn(() => 'ABC123');

  const servicio = crearPartidasService({ repositorio, jugadores, anticheat, notificador, reloj, generarCodigo });
  return { servicio, jugadores, anticheat, notificador, repositorio, reloj, generarCodigo, registro };
}

const duelo = { modo: 'duelo', mapa: 'dust', equipoA: [1], equipoB: [2], ganador: 'A' };

describe('registro de partidas con dependencias simuladas', () => {
  it('calcula los cambios, guarda la partida y notifica', async () => {
    const { servicio, jugadores, notificador, repositorio } = crearEntorno();
    const partida = await servicio.registrar(duelo);

    assert.equal(partida.codigo, 'ABC123');
    assert.equal(partida.registradaEn, '2026-11-01T10:00:00.000Z');
    assert.equal(partida.notificacion, 'enviada');
    assert.deepEqual(partida.cambios, [
      { jugadorId: 1, antes: 1500, despues: 1516, delta: 16 },
      { jugadorId: 2, antes: 1500, despues: 1484, delta: -16 },
    ]);

    assert.deepEqual(jugadores.registrarResultado.mock.calls[0].arguments, [1, { delta: 16, gano: true }]);
    assert.deepEqual(jugadores.registrarResultado.mock.calls[1].arguments, [2, { delta: -16, gano: false }]);
    assert.equal(repositorio.crear.mock.callCount(), 1);
    assert.deepEqual(notificador.enviar.mock.calls[0].arguments, [
      { tipo: 'partida_registrada', codigo: 'ABC123', modo: 'duelo', mapa: 'dust', ganador: 'A' },
    ]);
  });

  it('invierte los cambios cuando gana el equipo B', async () => {
    const { servicio } = crearEntorno();
    const partida = await servicio.registrar({ ...duelo, ganador: 'B' });
    assert.deepEqual(partida.cambios.map((c) => c.delta), [-16, 16]);
  });

  it('verifica el anticheat antes de tocar ningun dato y notifica al final', async () => {
    const { servicio, registro } = crearEntorno();
    await servicio.registrar(duelo);

    const tipos = registro.map(([tipo]) => tipo);
    assert.deepEqual(registro.filter(([tipo]) => tipo === 'anticheat').map(([, nick]) => nick), ['Uno', 'Dos']);
    assert.ok(tipos.lastIndexOf('anticheat') < tipos.indexOf('resultado'));
    assert.ok(tipos.lastIndexOf('resultado') < tipos.indexOf('guardar'));
    assert.ok(tipos.indexOf('guardar') < tipos.indexOf('notificar'));
  });

  it('usa el reloj y el generador de codigo inyectados', async () => {
    const { servicio, reloj, generarCodigo } = crearEntorno();
    await servicio.registrar(duelo);
    assert.equal(reloj.mock.callCount(), 1);
    assert.equal(generarCodigo.mock.callCount(), 1);
  });

  it('rechaza un jugador inexistente sin consultar el anticheat', async () => {
    const { servicio, anticheat } = crearEntorno();
    await assert.rejects(servicio.registrar({ ...duelo, equipoB: [99] }), (error) => {
      assert.equal(error.statusCode, 422);
      assert.equal(error.codigo, 'REFERENCIA_INVALIDA');
      assert.equal(error.detalles[0].campo, 'equipoB[0]');
      return true;
    });
    assert.equal(anticheat.verificar.mock.callCount(), 0);
  });

  it('rechaza jugadores sancionados y no cambia nada', async () => {
    const { servicio, anticheat, jugadores, repositorio, notificador } = crearEntorno();
    anticheat.verificar.mock.mockImplementation(async (nick) =>
      (nick === 'Dos' ? { limpio: false, motivo: 'Aimbot' } : { limpio: true }));

    await assert.rejects(servicio.registrar(duelo), (error) => {
      assert.equal(error.codigo, 'JUGADOR_SANCIONADO');
      assert.deepEqual(error.detalles, [{ campo: 'Dos', mensaje: 'Aimbot' }]);
      return true;
    });
    assert.equal(jugadores.registrarResultado.mock.callCount(), 0);
    assert.equal(repositorio.crear.mock.callCount(), 0);
    assert.equal(notificador.enviar.mock.callCount(), 0);
  });

  it('usa un mensaje por defecto si el anticheat no da motivo', async () => {
    const { servicio, anticheat } = crearEntorno();
    anticheat.verificar.mock.mockImplementation(async () => ({ limpio: false }));
    await assert.rejects(servicio.registrar(duelo), (error) => {
      assert.deepEqual(error.detalles.map((d) => d.mensaje), ['jugador sancionado', 'jugador sancionado']);
      return true;
    });
  });

  it('propaga la caida del anticheat y no guarda nada', async () => {
    const { servicio, anticheat, jugadores, repositorio } = crearEntorno();
    anticheat.verificar.mock.mockImplementation(async (nick) => {
      if (nick === 'Dos') throw new DependenciaError('caido', 'ANTICHEAT_NO_DISPONIBLE');
      return { limpio: true };
    });

    await assert.rejects(servicio.registrar(duelo), (error) => error.codigo === 'ANTICHEAT_NO_DISPONIBLE');
    assert.equal(jugadores.registrarResultado.mock.callCount(), 0);
    assert.equal(repositorio.crear.mock.callCount(), 0);
  });

  it('guarda la partida aunque falle la notificacion', async () => {
    const { servicio, notificador, repositorio } = crearEntorno();
    notificador.enviar.mock.mockImplementation(async () => {
      throw new Error('webhook caido');
    });

    const partida = await servicio.registrar(duelo);
    assert.equal(partida.notificacion, 'fallida');
    assert.equal(repositorio.crear.mock.callCount(), 1);
  });
});
