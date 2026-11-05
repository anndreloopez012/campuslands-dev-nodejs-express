import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { crearDestinoMemoria, crearNotificador } from '../src/adapters/notificador.js';
import { DependenciaError } from '../src/utils/errors.js';
import { levantar } from '../soporte/cliente.js';

const AHORA = new Date('2026-11-01T10:00:00.000Z');
const duelo = { modo: 'duelo', mapa: 'harbor', equipoA: [4], equipoB: [1], ganador: 'A' };
const competitivo = { modo: 'competitivo', mapa: 'dust', equipoA: [1, 2, 3], equipoB: [4, 5, 6], ganador: 'A' };

describe('API con dependencias simuladas', () => {
  let dependencias;
  let cliente;

  beforeEach(async () => {
    const bitacora = crearDestinoMemoria({ reloj: () => AHORA });
    dependencias = {
      anticheat: {
        tipo: 'mock',
        verificar: mock.fn(async () => ({ limpio: true })),
        ping: mock.fn(async () => true),
      },
      notificador: crearNotificador({ destinos: [bitacora] }),
      bitacora,
    };
    const servicios = crearServicios({ dependencias, reloj: () => AHORA, generarCodigo: () => 'FIXED1' });
    cliente = await levantar(crearApp(servicios));
  });

  afterEach(() => cliente.cerrar());

  it('responde la ruta principal', async () => {
    const { status, cuerpo } = await cliente.pedir('');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'mock de dependencias' });
  });

  describe('jugadores', () => {
    it('lista, filtra y pagina', async () => {
      const todos = await cliente.pedir('/jugadores');
      assert.equal(todos.cuerpo.paginacion.total, 8);
      const europa = await cliente.pedir('/jugadores?region=eu&orden=elo');
      assert.deepEqual(europa.cuerpo.data.map((j) => j.nick), ['Nocturne', 'Zephyr']);
      const pagina = await cliente.pedir('/jugadores?limite=3&pagina=3');
      assert.equal(pagina.cuerpo.data.length, 2);
    });

    it('arma el ranking por elo, con filtro de region', async () => {
      const general = await cliente.pedir('/jugadores/ranking');
      assert.deepEqual(general.cuerpo.data.map((j) => j.nick), ['Kitsune', 'Echo', 'Nocturne', 'Rook', 'Viper']);
      const latam = await cliente.pedir('/jugadores/ranking?region=latam');
      assert.deepEqual(latam.cuerpo.data.map((j) => j.nick), ['Rook', 'Blaze']);
    });

    it('crea un jugador con la fecha del reloj inyectado', async () => {
      const { status, cuerpo, cabeceras } = await cliente.json('/jugadores', { nick: 'Nova_7', region: 'eu' });
      assert.equal(status, 201);
      assert.equal(cuerpo.data.elo, 1000);
      assert.equal(cuerpo.data.creadoEn, AHORA.toISOString());
      assert.match(cabeceras.get('location'), /\/jugadores\/9$/);
    });

    it('valida nick, region y duplicados', async () => {
      assert.equal((await cliente.json('/jugadores', { nick: 'a b', region: 'eu' })).status, 400);
      assert.equal((await cliente.json('/jugadores', { nick: 'Nova', region: 'luna' })).status, 400);
      assert.equal((await cliente.json('/jugadores', { nick: 'viper', region: 'na' })).status, 409);
    });

    it('responde 404 si el jugador no existe', async () => {
      const { status, cuerpo } = await cliente.pedir('/jugadores/99');
      assert.equal(status, 404);
      assert.equal(cuerpo.codigo, 'JUGADOR_NO_ENCONTRADO');
    });
  });

  describe('partidas', () => {
    it('registra un duelo, consulta al anticheat y actualiza el elo', async () => {
      const { status, cuerpo, cabeceras } = await cliente.json('/partidas', duelo);
      assert.equal(status, 201);
      assert.equal(cuerpo.data.codigo, 'FIXED1');
      assert.equal(cuerpo.data.registradaEn, AHORA.toISOString());
      assert.equal(cuerpo.data.notificacion, 'enviada');
      assert.match(cabeceras.get('location'), /\/partidas\/1$/);

      const nicks = dependencias.anticheat.verificar.mock.calls.map((llamada) => llamada.arguments[0]);
      assert.deepEqual(nicks.sort(), ['Echo', 'Viper']);

      const ganador = await cliente.pedir('/jugadores/4');
      const perdedor = await cliente.pedir('/jugadores/1');
      assert.equal(ganador.cuerpo.data.elo, 1710 + cuerpo.data.cambios[0].delta);
      assert.equal(perdedor.cuerpo.data.elo, 1500 + cuerpo.data.cambios[1].delta);
      assert.equal(ganador.cuerpo.data.victorias, 46);
      assert.equal(perdedor.cuerpo.data.partidas, 41);
    });

    it('registra una partida competitiva 3v3', async () => {
      const { status, cuerpo } = await cliente.json('/partidas', competitivo);
      assert.equal(status, 201);
      assert.equal(cuerpo.data.cambios.length, 6);
      assert.equal(dependencias.anticheat.verificar.mock.callCount(), 6);
    });

    it('responde 422 y no cambia nada si hay un jugador sancionado', async () => {
      dependencias.anticheat.verificar.mock.mockImplementation(async (nick) =>
        (nick === 'Viper' ? { limpio: false, motivo: 'Wallhack' } : { limpio: true }));

      const { status, cuerpo } = await cliente.json('/partidas', duelo);
      assert.equal(status, 422);
      assert.equal(cuerpo.codigo, 'JUGADOR_SANCIONADO');
      assert.deepEqual(cuerpo.errores, [{ campo: 'Viper', mensaje: 'Wallhack' }]);

      assert.equal((await cliente.pedir('/jugadores/1')).cuerpo.data.elo, 1500);
      assert.equal((await cliente.pedir('/partidas')).cuerpo.paginacion.total, 0);
      assert.equal((await cliente.pedir('/eventos')).cuerpo.paginacion.total, 0);
    });

    it('responde 503 con Retry-After si el anticheat esta caido', async () => {
      dependencias.anticheat.verificar.mock.mockImplementation(async () => {
        throw new DependenciaError('caido', 'ANTICHEAT_NO_DISPONIBLE');
      });
      const { status, cuerpo, cabeceras } = await cliente.json('/partidas', duelo);
      assert.equal(status, 503);
      assert.equal(cuerpo.codigo, 'ANTICHEAT_NO_DISPONIBLE');
      assert.equal(cabeceras.get('retry-after'), '5');
      assert.equal((await cliente.pedir('/partidas')).cuerpo.paginacion.total, 0);
    });

    it('responde 422 si un jugador no existe, sin llamar al anticheat', async () => {
      const { status, cuerpo } = await cliente.json('/partidas', { ...duelo, equipoB: [99] });
      assert.equal(status, 422);
      assert.equal(cuerpo.codigo, 'REFERENCIA_INVALIDA');
      assert.equal(dependencias.anticheat.verificar.mock.callCount(), 0);
    });

    it('registra la partida aunque falle la notificacion', async () => {
      mock.method(dependencias.notificador, 'enviar', async () => {
        throw new Error('sin destinos');
      });
      const { status, cuerpo } = await cliente.json('/partidas', duelo);
      assert.equal(status, 201);
      assert.equal(cuerpo.data.notificacion, 'fallida');
      assert.equal((await cliente.pedir('/partidas')).cuerpo.paginacion.total, 1);
    });

    it('valida el body antes de llegar a las dependencias', async () => {
      const casos = {
        'equipos de tamano incorrecto': { ...competitivo, equipoA: [1] },
        'jugador en los dos equipos': { ...duelo, equipoB: [4] },
        'jugador repetido': { ...competitivo, equipoA: [1, 1, 2] },
        'modo desconocido': { ...duelo, modo: 'zombies' },
        'ganador invalido': { ...duelo, ganador: 'C' },
        'ids no numericos': { ...duelo, equipoA: ['4'] },
        'campo extra': { ...duelo, bonus: true },
        'campos faltantes': {},
      };
      for (const [nombre, cuerpo] of Object.entries(casos)) {
        const respuesta = await cliente.json('/partidas', cuerpo);
        assert.equal(respuesta.status, 400, nombre);
        assert.equal(respuesta.cuerpo.codigo, 'VALIDACION', nombre);
      }
      assert.equal(dependencias.anticheat.verificar.mock.callCount(), 0);
    });

    it('lista, filtra y consulta partidas', async () => {
      await cliente.json('/partidas', duelo);
      await cliente.json('/partidas', competitivo);

      const todas = await cliente.pedir('/partidas');
      assert.deepEqual(todas.cuerpo.data.map((p) => p.id), [2, 1]);
      const duelos = await cliente.pedir('/partidas?modo=duelo');
      assert.deepEqual(duelos.cuerpo.data.map((p) => p.id), [1]);
      const deEcho = await cliente.pedir('/partidas?jugadorId=4');
      assert.equal(deEcho.cuerpo.paginacion.total, 2);
      const deRook = await cliente.pedir('/partidas?jugadorId=6');
      assert.equal(deRook.cuerpo.paginacion.total, 1);

      assert.equal((await cliente.pedir('/partidas/1')).cuerpo.data.codigo, 'FIXED1');
      assert.equal((await cliente.pedir('/partidas/77')).status, 404);
    });

    it('exige JSON y rechaza metodos no permitidos', async () => {
      const texto = await cliente.pedir('/partidas', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
      assert.equal(texto.status, 415);
      const borrar = await cliente.pedir('/partidas/1', { method: 'DELETE' });
      assert.equal(borrar.status, 405);
      assert.equal(borrar.cabeceras.get('allow'), 'GET');
    });
  });

  describe('salud y eventos', () => {
    it('GET /salud responde 200 con el anticheat operativo', async () => {
      const { status, cuerpo } = await cliente.pedir('/salud');
      assert.equal(status, 200);
      assert.deepEqual(cuerpo.data, {
        ok: true,
        anticheat: { tipo: 'mock', estado: 'operativo' },
        notificador: { destinos: 1 },
      });
      assert.equal(dependencias.anticheat.ping.mock.callCount(), 1);
    });

    it('GET /salud responde 503 si el anticheat no responde', async () => {
      dependencias.anticheat.ping.mock.mockImplementation(async () => {
        throw new Error('sin respuesta');
      });
      const { status, cuerpo } = await cliente.pedir('/salud');
      assert.equal(status, 503);
      assert.equal(cuerpo.codigo, 'DEPENDENCIA_CAIDA');
      assert.equal(cuerpo.data.anticheat.estado, 'caido');
    });

    it('GET /eventos muestra lo que recibio el notificador', async () => {
      await cliente.json('/partidas', duelo);
      const { cuerpo } = await cliente.pedir('/eventos');
      assert.deepEqual(cuerpo.data, [{
        tipo: 'partida_registrada',
        codigo: 'FIXED1',
        modo: 'duelo',
        mapa: 'harbor',
        ganador: 'A',
        registradoEn: AHORA.toISOString(),
      }]);
    });
  });
});
