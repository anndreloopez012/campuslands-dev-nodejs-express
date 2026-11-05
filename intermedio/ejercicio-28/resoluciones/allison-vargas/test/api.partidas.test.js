import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { levantar } from '../soporte/cliente.js';

const AHORA = new Date('2026-11-01T10:00:00.000Z');

describe('API de partidas', () => {
  let cliente;

  beforeEach(async () => {
    cliente = await levantar(crearApp(crearServicios({ reloj: () => AHORA })));
  });

  afterEach(() => cliente.cerrar());

  const crearPartida = async (cupos = 3, mapa = 'isla') => (await cliente.json('/partidas', { mapa, cupos })).cuerpo.data.id;
  const unir = (partida, jugadorId) => cliente.json(`/partidas/${partida}/jugadores`, { jugadorId });
  const iniciar = (partida) => cliente.pedir(`/partidas/${partida}/iniciar`, { method: 'POST' });
  const eliminar = (partida, eliminadoId, eliminadorId) =>
    cliente.json(`/partidas/${partida}/eliminaciones`, eliminadorId === undefined ? { eliminadoId } : { eliminadoId, eliminadorId });

  async function partidaEnCurso(jugadores = [1, 2, 3]) {
    const id = await crearPartida(jugadores.length);
    for (const jugador of jugadores) await unir(id, jugador);
    await iniciar(id);
    return id;
  }

  describe('consulta', () => {
    it('lista las partidas mas recientes primero y filtra por estado y mapa', async () => {
      const todas = await cliente.pedir('/partidas');
      assert.deepEqual(todas.cuerpo.data.map((p) => p.id), [2, 1]);
      const finalizadas = await cliente.pedir('/partidas?estado=finalizada');
      assert.deepEqual(finalizadas.cuerpo.data.map((p) => p.id), [1]);
      const desierto = await cliente.pedir('/partidas?mapa=desierto&orden=id');
      assert.deepEqual(desierto.cuerpo.data.map((p) => p.id), [2]);
      assert.equal(finalizadas.cabeceras.get('x-total-count'), '1');
    });

    it('rechaza filtros invalidos', async () => {
      for (const consulta of ['estado=pausada', 'mapa=luna', 'orden=mapa']) {
        assert.equal((await cliente.pedir(`/partidas?${consulta}`)).status, 400, consulta);
      }
    });

    it('presenta la partida con vivos y sin exponer las eliminaciones', async () => {
      const { status, cuerpo } = await cliente.pedir('/partidas/1');
      assert.equal(status, 200);
      assert.equal(cuerpo.data.estado, 'finalizada');
      assert.equal(cuerpo.data.ganadorId, 4);
      assert.equal(cuerpo.data.vivos, 1);
      assert.equal('eliminaciones' in cuerpo.data, false);
    });

    it('responde 404 y 400 segun el id', async () => {
      assert.equal((await cliente.pedir('/partidas/99')).status, 404);
      assert.equal((await cliente.pedir('/partidas/abc')).status, 400);
    });
  });

  describe('creacion', () => {
    it('crea una partida en espera', async () => {
      const { status, cabeceras, cuerpo } = await cliente.json('/partidas', { mapa: 'artico', cupos: 5 });
      assert.equal(status, 201);
      assert.equal(cabeceras.get('location'), '/intermedio/ejercicio-28/partidas/3');
      assert.deepEqual(cuerpo.data, {
        id: 3,
        mapa: 'artico',
        cupos: 5,
        estado: 'esperando',
        participantes: [],
        vivos: 0,
        ganadorId: null,
        creadaEn: AHORA.toISOString(),
        iniciadaEn: null,
        finalizadaEn: null,
      });
    });

    it('valida mapa y cupos', async () => {
      const casos = [{}, { mapa: 'luna', cupos: 4 }, { mapa: 'isla', cupos: 1 }, { mapa: 'isla', cupos: 11 }, { mapa: 'isla', cupos: 2.5 }, { mapa: 'isla', cupos: 4, x: 1 }];
      for (const cuerpo of casos) {
        assert.equal((await cliente.json('/partidas', cuerpo)).status, 400, JSON.stringify(cuerpo));
      }
    });
  });

  describe('participantes', () => {
    it('une jugadores y devuelve la partida actualizada', async () => {
      const id = await crearPartida();
      const { status, cuerpo } = await unir(id, 1);
      assert.equal(status, 201);
      assert.deepEqual(cuerpo.data.participantes, [1]);
    });

    it('rechaza un jugador inexistente con 422', async () => {
      const id = await crearPartida();
      const { status, cuerpo } = await unir(id, 999);
      assert.equal(status, 422);
      assert.equal(cuerpo.codigo, 'REFERENCIA_INVALIDA');
    });

    it('rechaza un jugador repetido, uno ocupado en otra partida y una partida llena', async () => {
      const id = await crearPartida(2);
      await unir(id, 1);
      assert.equal((await unir(id, 1)).cuerpo.codigo, 'JUGADOR_YA_EN_PARTIDA');
      const otra = await crearPartida();
      const ocupado = await unir(otra, 1);
      assert.equal(ocupado.status, 409);
      assert.equal(ocupado.cuerpo.codigo, 'JUGADOR_OCUPADO');
      await unir(id, 2);
      const llena = await unir(id, 3);
      assert.equal(llena.status, 409);
      assert.equal(llena.cuerpo.codigo, 'PARTIDA_LLENA');
    });

    it('permite unir a un jugador que ya termino otra partida', async () => {
      const id = await crearPartida();
      assert.equal((await unir(id, 4)).status, 201);
    });

    it('retira un jugador y falla si no estaba', async () => {
      const id = await crearPartida();
      await unir(id, 1);
      const retirado = await cliente.pedir(`/partidas/${id}/jugadores/1`, { method: 'DELETE' });
      assert.equal(retirado.status, 200);
      assert.deepEqual(retirado.cuerpo.data.participantes, []);
      const otraVez = await cliente.pedir(`/partidas/${id}/jugadores/1`, { method: 'DELETE' });
      assert.equal(otraVez.status, 404);
      assert.equal(otraVez.cuerpo.codigo, 'JUGADOR_NO_EN_PARTIDA');
    });

    it('no admite cambios cuando la partida ya empezo', async () => {
      const id = await partidaEnCurso([1, 2]);
      const unirTarde = await unir(id, 3);
      assert.equal(unirTarde.status, 409);
      assert.equal(unirTarde.cuerpo.codigo, 'PARTIDA_CERRADA');
      const retirarTarde = await cliente.pedir(`/partidas/${id}/jugadores/1`, { method: 'DELETE' });
      assert.equal(retirarTarde.status, 409);
    });

    it('valida el cuerpo al unir', async () => {
      const id = await crearPartida();
      for (const cuerpo of [{}, { jugadorId: 'a' }, { jugadorId: 0 }, { jugadorId: 1, otro: 2 }]) {
        assert.equal((await cliente.json(`/partidas/${id}/jugadores`, cuerpo)).status, 400, JSON.stringify(cuerpo));
      }
    });
  });

  describe('inicio', () => {
    it('inicia con al menos dos jugadores y registra la hora', async () => {
      const id = await crearPartida();
      await unir(id, 1);
      const pocos = await iniciar(id);
      assert.equal(pocos.status, 409);
      assert.equal(pocos.cuerpo.codigo, 'JUGADORES_INSUFICIENTES');
      await unir(id, 2);
      const { status, cuerpo } = await iniciar(id);
      assert.equal(status, 200);
      assert.equal(cuerpo.data.estado, 'en_curso');
      assert.equal(cuerpo.data.iniciadaEn, AHORA.toISOString());
      assert.equal((await iniciar(id)).cuerpo.codigo, 'PARTIDA_CERRADA');
    });
  });

  describe('eliminaciones', () => {
    it('solo se eliminan jugadores en una partida en curso', async () => {
      const id = await crearPartida();
      const { status, cuerpo } = await eliminar(id, 1);
      assert.equal(status, 409);
      assert.equal(cuerpo.codigo, 'PARTIDA_NO_EN_CURSO');
    });

    it('lleva la cuenta de vivos y la posicion de cada eliminado', async () => {
      const id = await partidaEnCurso([1, 2, 3]);
      const { status, cuerpo } = await eliminar(id, 3, 1);
      assert.equal(status, 200);
      assert.deepEqual(cuerpo.data, { eliminadoId: 3, posicion: 3, restantes: 2, finalizada: false, ganadorId: null });
      assert.equal((await cliente.pedir(`/partidas/${id}`)).cuerpo.data.vivos, 2);
    });

    it('cierra la partida al quedar un solo jugador y actualiza sus estadisticas', async () => {
      const id = await partidaEnCurso([1, 2, 3]);
      await eliminar(id, 3, 1);
      const final = await eliminar(id, 2, 1);
      assert.deepEqual(final.cuerpo.data, { eliminadoId: 2, posicion: 2, restantes: 1, finalizada: true, ganadorId: 1 });

      const partida = (await cliente.pedir(`/partidas/${id}`)).cuerpo.data;
      assert.equal(partida.estado, 'finalizada');
      assert.equal(partida.ganadorId, 1);
      assert.equal(partida.finalizadaEn, AHORA.toISOString());

      const ganador = (await cliente.pedir('/jugadores/1')).cuerpo.data;
      assert.deepEqual([ganador.partidas, ganador.victorias, ganador.kills], [43, 10, 122]);
      const perdedor = (await cliente.pedir('/jugadores/2')).cuerpo.data;
      assert.deepEqual([perdedor.partidas, perdedor.victorias, perdedor.kills], [56, 14, 210]);
    });

    it('acepta eliminaciones sin eliminador, por ejemplo por la zona', async () => {
      const id = await partidaEnCurso([1, 2]);
      const { status, cuerpo } = await eliminar(id, 1);
      assert.equal(status, 200);
      assert.equal(cuerpo.data.ganadorId, 2);
    });

    it('rechaza jugadores ajenos, ya eliminados o autoeliminaciones', async () => {
      const id = await partidaEnCurso([1, 2, 3]);
      const ajeno = await eliminar(id, 5);
      assert.equal(ajeno.status, 422);
      const ajenoEliminador = await eliminar(id, 1, 5);
      assert.equal(ajenoEliminador.status, 422);
      const propio = await eliminar(id, 1, 1);
      assert.equal(propio.status, 422);
      assert.equal(propio.cuerpo.codigo, 'ELIMINACION_INVALIDA');
      await eliminar(id, 3, 1);
      const repetido = await eliminar(id, 3, 1);
      assert.equal(repetido.status, 409);
      assert.equal(repetido.cuerpo.codigo, 'JUGADOR_YA_ELIMINADO');
      const muerto = await eliminar(id, 1, 3);
      assert.equal(muerto.status, 409);
    });

    it('valida el cuerpo', async () => {
      const id = await partidaEnCurso([1, 2]);
      for (const cuerpo of [{}, { eliminadoId: 'x' }, { eliminadoId: 1, eliminadorId: 0 }, { eliminadoId: 1, otro: true }]) {
        assert.equal((await cliente.json(`/partidas/${id}/eliminaciones`, cuerpo)).status, 400, JSON.stringify(cuerpo));
      }
    });
  });

  describe('resultados', () => {
    it('devuelve la tabla de posiciones de una partida terminada', async () => {
      const { status, cuerpo } = await cliente.pedir('/partidas/1/resultados');
      assert.equal(status, 200);
      assert.deepEqual(cuerpo.data, [
        { posicion: 1, jugadorId: 4, nick: 'Kenji', kills: 3 },
        { posicion: 2, jugadorId: 2, nick: 'Valkyria', kills: 0 },
        { posicion: 3, jugadorId: 1, nick: 'Ghost', kills: 0 },
        { posicion: 4, jugadorId: 3, nick: 'Rastro', kills: 0 },
      ]);
    });

    it('no hay resultados mientras la partida no termine', async () => {
      const { status, cuerpo } = await cliente.pedir('/partidas/2/resultados');
      assert.equal(status, 409);
      assert.equal(cuerpo.codigo, 'PARTIDA_NO_FINALIZADA');
    });
  });

  it('responde 405 con Allow en metodos no permitidos', async () => {
    const casos = [
      ['/partidas', 'DELETE', 'GET, POST'],
      ['/partidas/1', 'PUT', 'GET'],
      ['/partidas/1/iniciar', 'GET', 'POST'],
      ['/partidas/1/jugadores', 'GET', 'POST'],
      ['/partidas/1/jugadores/1', 'POST', 'DELETE'],
      ['/partidas/1/eliminaciones', 'GET', 'POST'],
      ['/partidas/1/resultados', 'POST', 'GET'],
    ];
    for (const [ruta, metodo, permitidos] of casos) {
      const { status, cabeceras } = await cliente.pedir(ruta, { method: metodo });
      assert.equal(status, 405, `${metodo} ${ruta}`);
      assert.equal(cabeceras.get('allow'), permitidos);
    }
  });
});
