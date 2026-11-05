import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Router } from 'express';
import { levantarApi } from '../soporte/api.js';
import { MODULOS } from '../src/modulos/index.js';
import { MemoryRepository } from '../src/repositories/memory.repository.js';
import { crearTablaDePuntajes } from '../src/modulos/clasificacion/clasificacion.store.js';
import { crearApp } from '../src/app.js';

describe('modulos desacoplados por eventos', () => {
  let api;

  afterEach(() => api.cerrar());

  const jugar = async (a, b, pa, pb) => {
    const partida = await api.json('/partidas', { jugadorA: a, jugadorB: b, mapa: 'Bastion' });
    return api.json(`/partidas/${partida.cuerpo.data.id}/resultado`, { puntajeA: pa, puntajeB: pb });
  };

  it('dos resultados simultaneos para la misma partida: uno gana y el otro recibe 409', async () => {
    api = await levantarApi();
    await api.json('/partidas', { jugadorA: 1, jugadorB: 2, mapa: 'Puerto' });
    const envios = await Promise.all([
      api.json('/partidas/1/resultado', { puntajeA: 13, puntajeB: 2 }),
      api.json('/partidas/1/resultado', { puntajeA: 2, puntajeB: 13 }),
    ]);
    assert.deepEqual(envios.map((e) => e.status).sort(), [200, 409]);
    const { cuerpo } = await api.pedir('/clasificacion?limite=50');
    assert.equal(cuerpo.data.reduce((suma, fila) => suma + fila.rating, 0), 8000);
    const movidos = cuerpo.data.filter((fila) => fila.rating !== 1000);
    assert.equal(movidos.length, 2);
    assert.deepEqual(movidos.map((fila) => Math.abs(fila.rating - 1000)), [16, 16]);
  });

  it('si clasificacion falla, la partida igual queda registrada y el fallo se loguea', async () => {
    const tabla = crearTablaDePuntajes();
    let roto = false;
    const tablaInestable = {
      ...tabla,
      guardar: (id, fila) => {
        if (roto) throw new Error('disco lleno');
        tabla.guardar(id, fila);
      },
    };
    api = await levantarApi({ sobreescribir: { 'clasificacion.tabla': tablaInestable } });
    roto = true;
    const { status, cuerpo } = await jugar(1, 2, 13, 4);
    assert.equal(status, 200);
    assert.equal(cuerpo.data.estado, 'finalizada');
    const fallo = api.logs.find((l) => l.msg === 'manejador_de_evento_fallido');
    assert.equal(fallo.evento, 'partida.finalizada');
    assert.equal(fallo.error, 'disco lleno');
    roto = false;
    const { cuerpo: ranking } = await api.pedir('/clasificacion?limite=50');
    assert.ok(ranking.data.every((fila) => fila.rating === 1000));
  });

  it('un evento repetido no cuenta dos veces', async () => {
    api = await levantarApi();
    await jugar(1, 2, 13, 4);
    const bus = api.contenedor.resolver('eventos');
    const carga = { partidaId: 1, ganadorId: 1, perdedorId: 2, puntajeGanador: 13, puntajePerdedor: 4, mapa: 'Bastion' };
    await bus.emitir('partida.finalizada', carga);
    await bus.emitir('partida.finalizada', carga);
    const { cuerpo } = await api.pedir('/clasificacion/1');
    assert.deepEqual([cuerpo.data.rating, cuerpo.data.partidas], [1016, 1]);
  });

  it('las dependencias se pueden sustituir: jugadores con otro repositorio', async () => {
    const repositorio = new MemoryRepository([
      { id: 1, alias: 'Solo', region: 'NA', creadoEn: '2026-01-01T00:00:00.000Z' },
      { id: 2, alias: 'Duo', region: 'EU', creadoEn: '2026-01-01T00:00:00.000Z' },
    ]);
    api = await levantarApi({ sobreescribir: { 'jugadores.repositorio': repositorio } });
    assert.equal((await api.pedir('/jugadores')).cuerpo.data.length, 2);
    assert.equal((await api.pedir('/clasificacion')).cuerpo.data.length, 2);
    assert.equal((await jugar(1, 2, 13, 0)).status, 200);
    assert.equal((await api.json('/partidas', { jugadorA: 1, jugadorB: 3, mapa: 'Puerto' })).status, 422);
  });

  it('sumar un modulo nuevo no exige tocar los existentes', async () => {
    const equipos = {
      nombre: 'equipos',
      ruta: '/equipos',
      dependencias: ['jugadores'],
      emite: [],
      escucha: ['partida.finalizada'],
      registrar(contenedor) {
        contenedor.registrar('equipos.victorias', () => ({ total: 0 }));
      },
      alIniciar(contenedor) {
        const victorias = contenedor.resolver('equipos.victorias');
        contenedor.resolver('eventos').suscribir('partida.finalizada', () => {
          victorias.total += 1;
        });
      },
      crearRouter(contenedor) {
        const router = Router();
        const jugadores = contenedor.resolver('jugadores');
        router.get('/', (req, res) => {
          res.json({ ok: true, partidas: contenedor.resolver('equipos.victorias').total, jugadores: jugadores.contar() });
        });
        return router;
      },
      estado: () => ({ ok: true }),
    };
    api = await levantarApi({ modulos: [equipos, ...MODULOS] });
    assert.deepEqual(api.app.modulos.map((m) => m.nombre), ['jugadores', 'equipos', 'partidas', 'clasificacion']);
    await jugar(1, 2, 13, 4);
    await jugar(3, 4, 13, 4);
    assert.deepEqual((await api.pedir('/equipos')).cuerpo, { ok: true, partidas: 2, jugadores: 8 });
    assert.equal((await api.pedir('/modulos')).cuerpo.data.length, 4);
    assert.equal((await api.pedir('/clasificacion')).status, 200);
  });

  it('un modulo con dependencias imposibles impide arrancar', () => {
    const huerfano = { nombre: 'huerfano', ruta: '/huerfano', dependencias: ['nada'], registrar() {}, crearRouter: () => Router() };
    assert.throws(() => crearApp({ env: { NODE_ENV: 'test' }, modulos: [...MODULOS, huerfano] }), /huerfano depende de nada/);
  });

  it('las instancias de la app no comparten estado entre si', async () => {
    api = await levantarApi();
    const otra = await levantarApi();
    try {
      await api.json('/jugadores', { alias: 'Aislado', region: 'NA' });
      assert.equal((await api.pedir('/jugadores')).cuerpo.data.length, 9);
      assert.equal((await otra.pedir('/jugadores')).cuerpo.data.length, 8);
      await otra.json('/partidas', { jugadorA: 1, jugadorB: 2, mapa: 'Puerto' });
      assert.equal((await api.pedir('/partidas')).cuerpo.data.length, 0);
    } finally {
      await otra.cerrar();
    }
  });

  it('al detener la app se llaman los ganchos de los modulos en orden inverso', async () => {
    const orden = [];
    const marcador = (nombre, dependencias = []) => ({
      nombre,
      ruta: `/${nombre}`,
      dependencias,
      registrar() {},
      crearRouter: () => Router(),
      alDetener: async () => {
        orden.push(nombre);
      },
    });
    api = await levantarApi({ modulos: [marcador('b', ['a']), marcador('a')] });
    await api.app.detenerModulos();
    assert.deepEqual(orden, ['b', 'a']);
  });
});
