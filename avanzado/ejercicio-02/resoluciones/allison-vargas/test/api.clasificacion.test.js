import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { levantarApi } from '../soporte/api.js';
import { crearTablaDePuntajes } from '../src/modulos/clasificacion/clasificacion.store.js';
import { calcularCambio } from '../src/modulos/clasificacion/clasificacion.service.js';

describe('calculo de rating', () => {
  it('entre iguales el ganador gana la mitad del factor K', () => {
    assert.equal(calcularCambio(1000, 1000), 16);
  });

  it('ganarle a alguien mas fuerte vale mas que ganarle a alguien mas debil', () => {
    assert.ok(calcularCambio(1000, 1200) > calcularCambio(1000, 1000));
    assert.ok(calcularCambio(1200, 1000) < calcularCambio(1000, 1000));
    assert.equal(calcularCambio(1000, 1016), 17);
  });

  it('el cambio nunca supera el factor K ni baja de cero', () => {
    assert.ok(calcularCambio(0, 4000) <= 32);
    assert.ok(calcularCambio(4000, 0) >= 0);
  });
});

describe('API de clasificacion', () => {
  let api;

  beforeEach(async () => {
    api = await levantarApi();
  });

  afterEach(() => api.cerrar());

  const jugar = async (jugadorA, jugadorB, puntajeA, puntajeB) => {
    const partida = await api.json('/partidas', { jugadorA, jugadorB, mapa: 'Bastion' });
    return api.json(`/partidas/${partida.cuerpo.data.id}/resultado`, { puntajeA, puntajeB });
  };

  it('arranca con todos los jugadores en 1000 ordenados por id', async () => {
    const { status, cuerpo } = await api.pedir('/clasificacion?limite=50');
    assert.equal(status, 200);
    assert.equal(cuerpo.data.length, 8);
    assert.ok(cuerpo.data.every((fila) => fila.rating === 1000 && fila.partidas === 0));
    assert.deepEqual(cuerpo.data.map((fila) => fila.jugadorId), [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.deepEqual(cuerpo.data[0], {
      posicion: 1,
      jugadorId: 1,
      alias: 'Viper_X',
      region: 'NA',
      rating: 1000,
      partidas: 0,
      victorias: 0,
      derrotas: 0,
    });
  });

  it('una partida finalizada mueve el rating sin que nadie llame a clasificacion', async () => {
    await jugar(1, 2, 13, 9);
    const { cuerpo } = await api.pedir('/clasificacion?limite=50');
    const fila = (id) => cuerpo.data.find((f) => f.jugadorId === id);
    assert.deepEqual([fila(1).rating, fila(1).victorias, fila(1).partidas], [1016, 1, 1]);
    assert.deepEqual([fila(2).rating, fila(2).derrotas, fila(2).partidas], [984, 1, 1]);
    assert.equal(fila(1).posicion, 1);
    assert.equal(fila(2).posicion, 8);
  });

  it('la suma de ratings se conserva despues de varias partidas', async () => {
    await jugar(1, 2, 13, 9);
    await jugar(3, 1, 13, 0);
    await jugar(4, 5, 7, 13);
    await jugar(2, 6, 13, 12);
    await jugar(1, 8, 20, 18);
    const { cuerpo } = await api.pedir('/clasificacion?limite=50');
    assert.equal(cuerpo.data.reduce((suma, fila) => suma + fila.rating, 0), 8000);
    const ratings = cuerpo.data.map((fila) => fila.rating);
    assert.deepEqual(ratings, [...ratings].sort((a, b) => b - a));
    assert.deepEqual(cuerpo.data.map((fila) => fila.posicion), [1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('el rating depende del rival: el segundo triunfo vale distinto', async () => {
    await jugar(1, 2, 13, 9);
    await jugar(3, 1, 13, 0);
    const { cuerpo } = await api.pedir('/clasificacion/3');
    assert.equal(cuerpo.data.rating, 1017);
    assert.equal((await api.pedir('/clasificacion/1')).cuerpo.data.rating, 999);
  });

  it('desempata por rating, luego victorias y luego id', async () => {
    const tabla = crearTablaDePuntajes();
    tabla.guardar(4, { rating: 1100, partidas: 5, victorias: 3, derrotas: 2 });
    tabla.guardar(6, { rating: 1100, partidas: 5, victorias: 5, derrotas: 0 });
    tabla.guardar(2, { rating: 1100, partidas: 5, victorias: 5, derrotas: 0 });
    tabla.guardar(8, { rating: 1200, partidas: 9, victorias: 1, derrotas: 8 });
    const otra = await levantarApi({ sobreescribir: { 'clasificacion.tabla': tabla } });
    try {
      const { cuerpo } = await otra.pedir('/clasificacion?limite=50');
      assert.deepEqual(cuerpo.data.slice(0, 4).map((fila) => fila.jugadorId), [8, 2, 6, 4]);
      assert.equal(cuerpo.data.length, 8);
    } finally {
      await otra.cerrar();
    }
  });

  it('filtra por region manteniendo la posicion global', async () => {
    await jugar(5, 1, 13, 2);
    const { cuerpo } = await api.pedir('/clasificacion?region=LATAM');
    assert.deepEqual(cuerpo.data.map((f) => [f.alias, f.posicion]), [['Halcon', 1], ['Kestrel', 3]]);
    assert.equal(cuerpo.paginacion.total, 2);
  });

  it('pagina el ranking', async () => {
    const { cuerpo, cabeceras } = await api.pedir('/clasificacion?limite=3&pagina=3');
    assert.equal(cuerpo.data.length, 2);
    assert.deepEqual(cuerpo.paginacion, { pagina: 3, limite: 3, total: 8, totalPaginas: 3 });
    assert.equal(cabeceras.get('x-total-count'), '8');
  });

  it('consulta un jugador y responde 404 si no existe', async () => {
    const uno = await api.pedir('/clasificacion/7');
    assert.equal(uno.cuerpo.data.alias, 'Rogue_9');
    const faltante = await api.pedir('/clasificacion/99');
    assert.deepEqual([faltante.status, faltante.cuerpo.codigo], [404, 'JUGADOR_NO_ENCONTRADO']);
    assert.equal((await api.pedir('/clasificacion/abc')).cuerpo.codigo, 'ID_INVALIDO');
  });

  it('un jugador nuevo aparece en el ranking gracias al evento', async () => {
    await api.json('/jugadores', { alias: 'Nuevo', region: 'ASIA' });
    const { cuerpo } = await api.pedir('/clasificacion?limite=50');
    assert.equal(cuerpo.data.length, 9);
    const nuevo = cuerpo.data.find((f) => f.alias === 'Nuevo');
    assert.deepEqual([nuevo.rating, nuevo.posicion, nuevo.partidas], [1000, 9, 0]);
  });

  it('valida la consulta', async () => {
    for (const consulta of ['region=Z', 'orden=rating', 'limite=0', 'extra=1']) {
      assert.equal((await api.pedir(`/clasificacion?${consulta}`)).status, 400, consulta);
    }
    const metodo = await api.pedir('/clasificacion', { method: 'POST' });
    assert.deepEqual([metodo.status, metodo.cabeceras.get('allow')], [405, 'GET']);
  });
});

describe('cache de la clasificacion', () => {
  let api;

  beforeEach(async () => {
    api = await levantarApi();
  });

  afterEach(() => api.cerrar());

  it('la segunda lectura sale de la cache', async () => {
    assert.equal((await api.pedir('/clasificacion')).cabeceras.get('x-cache'), 'MISS');
    assert.equal((await api.pedir('/clasificacion')).cabeceras.get('x-cache'), 'HIT');
    assert.equal((await api.pedir('/clasificacion?region=EU&limite=1')).cabeceras.get('x-cache'), 'HIT');
    assert.equal((await api.pedir('/clasificacion/3')).cabeceras.get('x-cache'), 'HIT');
  });

  it('un resultado nuevo invalida la cache', async () => {
    await api.pedir('/clasificacion');
    const partida = await api.json('/partidas', { jugadorA: 1, jugadorB: 2, mapa: 'Puerto' });
    assert.equal((await api.pedir('/clasificacion')).cabeceras.get('x-cache'), 'HIT');
    await api.json(`/partidas/${partida.cuerpo.data.id}/resultado`, { puntajeA: 13, puntajeB: 3 });
    const despues = await api.pedir('/clasificacion');
    assert.equal(despues.cabeceras.get('x-cache'), 'MISS');
    assert.equal(despues.cuerpo.data[0].rating, 1016);
    assert.equal((await api.pedir('/clasificacion')).cabeceras.get('x-cache'), 'HIT');
  });

  it('un jugador nuevo invalida la cache', async () => {
    await api.pedir('/clasificacion');
    await api.json('/jugadores', { alias: 'Extra', region: 'NA' });
    assert.equal((await api.pedir('/clasificacion')).cabeceras.get('x-cache'), 'MISS');
  });

  it('vence con el TTL configurado', async () => {
    await api.pedir('/clasificacion');
    api.reloj.avanzar(4999);
    assert.equal((await api.pedir('/clasificacion')).cabeceras.get('x-cache'), 'HIT');
    api.reloj.avanzar(2);
    assert.equal((await api.pedir('/clasificacion')).cabeceras.get('x-cache'), 'MISS');
  });

  it('permite revalidar con ETag y responde 304', async () => {
    const primera = await api.pedir('/clasificacion');
    const etag = primera.cabeceras.get('etag');
    assert.ok(etag);
    assert.equal(primera.cabeceras.get('cache-control'), 'no-cache');
    const estado = await new Promise((resolver, rechazar) => {
      http.get(
        `${api.origen}/avanzado/ejercicio-02/clasificacion`,
        { headers: { 'if-none-match': etag } },
        (respuesta) => {
          respuesta.resume();
          respuesta.on('end', () => resolver(respuesta.statusCode));
        },
      ).on('error', rechazar);
    });
    assert.equal(estado, 304);
  });
});
