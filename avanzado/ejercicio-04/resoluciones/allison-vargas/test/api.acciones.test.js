import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { RepositorioDePartidas } from '../src/repositories/partidas.repository.js';
import { levantar } from '../soporte/cliente.js';
import { levantarApi } from '../soporte/api.js';
import { AHORA, LOOT_FIJO, aparicionFija } from '../soporte/datos.js';

async function iniciada(api) {
  await api.json('/partidas/1/unirse', { jugadorId: 1 });
  await api.json('/partidas/1/unirse', { jugadorId: 2 });
  await api.pedir('/partidas/1/iniciar', { method: 'POST' });
}

describe('lote de acciones', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); await iniciada(api); });
  afterEach(() => api.cerrar());

  it('ejecuta todas las acciones y reporta exito y error por separado', async () => {
    const { status, cuerpo } = await api.json('/partidas/1/acciones', {
      acciones: [
        { tipo: 'recoger', jugadorId: 1, objetoId: 1 },
        { tipo: 'curar', jugadorId: 1 },
        { tipo: 'disparar', atacanteId: 1, objetivoId: 2 },
        { tipo: 'mover', jugadorId: 1, x: 500, y: 0 },
      ],
    });
    assert.equal(status, 200);
    const { resultados, resumen } = cuerpo.data;
    assert.deepEqual(resumen, { ok: 2, error: 2, omitidas: 0 });
    assert.deepEqual(resultados.map((r) => r.estado), ['ok', 'error', 'ok', 'error']);
    assert.equal(resultados[1].problema.codigo, 'SIN_BOTIQUIN');
    assert.equal(resultados[1].problema.status, 422);
    assert.equal(resultados[3].problema.codigo, 'FUERA_DE_MAPA');
    assert.equal(resultados[3].problema.instance, '/avanzado/ejercicio-04/partidas/1/acciones');
    assert.equal(resultados[0].problema, undefined);
  });

  it('cada problema del lote lleva el mismo idPeticion de la respuesta', async () => {
    const { cuerpo, cabeceras } = await api.json('/partidas/1/acciones', {
      acciones: [{ tipo: 'curar', jugadorId: 1 }],
    });
    assert.equal(cuerpo.data.resultados[0].problema.idPeticion, cabeceras.get('x-request-id'));
  });

  it('con detenerEnError omite lo que sigue despues del primer fallo', async () => {
    const { cuerpo } = await api.json('/partidas/1/acciones', {
      detenerEnError: true,
      acciones: [
        { tipo: 'curar', jugadorId: 1 },
        { tipo: 'recoger', jugadorId: 1, objetoId: 1 },
        { tipo: 'recoger', jugadorId: 1, objetoId: 3 },
      ],
    });
    assert.deepEqual(cuerpo.data.resultados.map((r) => r.estado), ['error', 'omitida', 'omitida']);
    assert.deepEqual(cuerpo.data.resumen, { ok: 0, error: 1, omitidas: 2 });
    const detalle = await api.pedir('/partidas/1');
    assert.deepEqual(detalle.cuerpo.data.jugadores[0].inventario, []);
  });

  it('las acciones se aplican en orden y se ven reflejadas en la partida', async () => {
    const { cuerpo } = await api.json('/partidas/1/acciones', {
      acciones: [
        { tipo: 'recoger', jugadorId: 1, objetoId: 2 },
        { tipo: 'disparar', atacanteId: 1, objetivoId: 2 },
        { tipo: 'disparar', atacanteId: 1, objetivoId: 2 },
        { tipo: 'disparar', atacanteId: 1, objetivoId: 2 },
        { tipo: 'disparar', atacanteId: 1, objetivoId: 2 },
        { tipo: 'disparar', atacanteId: 1, objetivoId: 2 },
      ],
    });
    assert.deepEqual(cuerpo.data.resumen, { ok: 5, error: 1, omitidas: 0 });
    assert.equal(cuerpo.data.resultados[5].problema.codigo, 'PARTIDA_TERMINADA');
    assert.equal(cuerpo.data.partida.ganadorId, 1);
  });

  it('valida cada elemento indicando su posicion', async () => {
    const { status, cuerpo } = await api.json('/partidas/1/acciones', {
      acciones: [
        { tipo: 'mover', jugadorId: 1, x: 1 },
        { tipo: 'volar', jugadorId: 1 },
        { tipo: 'curar', jugadorId: 1, extra: true },
        'texto',
      ],
    });
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores, [
      { campo: 'acciones[0].y', mensaje: 'es obligatorio' },
      { campo: 'acciones[1].tipo', mensaje: 'debe ser uno de: mover, recoger, disparar, curar' },
      { campo: 'acciones[2].extra', mensaje: 'campo no permitido' },
      { campo: 'acciones[3]', mensaje: 'debe ser un objeto' },
    ]);
  });

  it('limita el tamano del lote y valida la lista', async () => {
    const vacio = await api.json('/partidas/1/acciones', { acciones: [] });
    assert.equal(vacio.cuerpo.errores[0].mensaje, 'debe tener entre 1 y 20 acciones');
    const muchas = await api.json('/partidas/1/acciones', {
      acciones: Array.from({ length: 21 }, () => ({ tipo: 'curar', jugadorId: 1 })),
    });
    assert.equal(muchas.status, 400);
    const tipo = await api.json('/partidas/1/acciones', { acciones: 'curar', detenerEnError: 'si' });
    assert.deepEqual(tipo.cuerpo.errores.map((e) => e.campo), ['acciones', 'detenerEnError']);
  });

  it('un lote sobre una partida inexistente responde 404 completo', async () => {
    const { status, cuerpo } = await api.json('/partidas/50/acciones', { acciones: [{ tipo: 'curar', jugadorId: 1 }] });
    assert.equal(status, 404);
    assert.equal(cuerpo.codigo, 'PARTIDA_NO_ENCONTRADA');
  });
});

describe('lote con un fallo inesperado', () => {
  it('no lo esconde como resultado del lote: responde 500 y lo registra', async () => {
    const registros = [];
    const repositorio = new RepositorioDePartidas();
    const servicios = crearServicios({
      reloj: () => AHORA,
      aparicion: aparicionFija,
      plantillaLoot: LOOT_FIJO,
      repositorioDePartidas: repositorio,
    });
    const api = await levantar(crearApp({ servicios, registro: (entrada) => registros.push(entrada) }));
    try {
      await iniciada(api);
      repositorio.buscar(1).mover = () => {
        throw new TypeError('indice corrupto en memoria');
      };
      const { status, cuerpo } = await api.json('/partidas/1/acciones', {
        acciones: [{ tipo: 'mover', jugadorId: 1, x: 51, y: 50 }],
      });
      assert.equal(status, 500);
      assert.equal(cuerpo.codigo, 'ERROR_INTERNO');
      assert.doesNotMatch(JSON.stringify(cuerpo), /indice corrupto/);
      assert.equal(registros.length, 1);
      assert.equal(registros[0].mensaje, 'indice corrupto en memoria');
      assert.equal(registros[0].idPeticion, cuerpo.idPeticion);
    } finally {
      await api.cerrar();
    }
  });
});
