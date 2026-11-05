import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { esErrorDeRegla } from '../src/errores/index.js';
import { crearAzar } from '../soporte/datos.js';
import { crearEntorno, fichaje, rechazaCon } from '../soporte/entorno.js';

function puertaDoble(paso = 'validado') {
  let llegadas = 0;
  let liberar;
  const puerta = new Promise((resolver) => { liberar = resolver; });
  return async (actual) => {
    if (actual !== paso || llegadas >= 2) return;
    llegadas += 1;
    if (llegadas === 2) liberar();
    await puerta;
  };
}

describe('operaciones simultaneas', () => {
  it('dos compras de jugadores distintos al mismo club vendedor se componen sin perder dinero', async () => {
    const e = crearEntorno({ pausa: puertaDoble() });
    const [a, b] = await Promise.all([
      e.servicios.fichajes.fichar(fichaje(21, 1, 9000)),
      e.servicios.fichajes.fichar(fichaje(22, 3, 9000)),
    ]);
    assert.equal(a.respuesta.destinoId, 1);
    assert.equal(b.respuesta.destinoId, 3);
    const vendedor = e.almacen.obtener('clubes', 2);
    assert.equal(vendedor.presupuesto, 90000 + 18000);
    assert.equal(vendedor.plantilla, 18);
    assert.deepEqual(e.servicios.auditoria.verificar().violaciones, []);
    assert.deepEqual(e.servicios.transacciones.listar().map((t) => t.estado), ['confirmada', 'conflicto', 'confirmada']);
  });

  it('dos compradores del mismo jugador: el segundo se reevalua con el dato nuevo', async () => {
    const e = crearEntorno({ pausa: puertaDoble() });
    const resultados = await Promise.allSettled([
      e.servicios.fichajes.fichar(fichaje(21, 1, 9000)),
      e.servicios.fichajes.fichar(fichaje(21, 3, 9000)),
    ]);
    assert.equal(resultados[0].status, 'fulfilled');
    assert.equal(resultados[1].status, 'rejected');
    assert.ok(rechazaCon('JUGADOR_RECIEN_FICHADO', { jugadorId: 21 })(resultados[1].reason));
    assert.equal(e.almacen.obtener('jugadores', 21).clubId, 1);
    assert.equal(e.servicios.fichajes.listar({ pagina: 1, limite: 10 }).data.length, 1);
    assert.deepEqual(e.servicios.transacciones.listar().map((t) => t.estado), ['confirmada', 'conflicto', 'revertida']);
    assert.deepEqual(e.servicios.auditoria.verificar().violaciones, []);
  });

  it('la misma clave de idempotencia en paralelo ejecuta una sola vez', async () => {
    const e = crearEntorno({ pausa: puertaDoble() });
    const [a, b] = await Promise.all([
      e.servicios.fichajes.fichar(fichaje(21, 1, 9000), 'clave-par-01'),
      e.servicios.fichajes.fichar(fichaje(21, 1, 9000), 'clave-par-01'),
    ]);
    assert.deepEqual([a.repetida, b.repetida].sort(), [false, true]);
    assert.deepEqual(a.respuesta, b.respuesta);
    assert.equal(e.servicios.fichajes.listar({ pagina: 1, limite: 10 }).data.length, 1);
    assert.equal(e.almacen.obtener('clubes', 1).presupuesto, 120000 - 9450);
  });

  it('sin reintentos el segundo recibe el conflicto', async () => {
    const e = crearEntorno({ pausa: puertaDoble(), reintentos: 0 });
    const resultados = await Promise.allSettled([
      e.servicios.fichajes.fichar(fichaje(21, 1, 9000)),
      e.servicios.fichajes.fichar(fichaje(22, 3, 9000)),
    ]);
    assert.equal(resultados[0].status, 'fulfilled');
    assert.ok(rechazaCon('CONFLICTO_DE_VERSION')(resultados[1].reason));
    assert.equal(e.almacen.obtener('jugadores', 22).clubId, 2);
  });
});

describe('carga mezclada', () => {
  it('muchas operaciones entrelazadas mantienen todos los invariantes', async () => {
    const azar = crearAzar(2026);
    const e = crearEntorno({
      reintentos: 200,
      pausa: () => new Promise((resolver) => { setImmediate(resolver); }),
    });
    const clubesFutbol = [1, 2, 3, 4];
    const peticiones = Array.from({ length: 40 }, (_, i) => {
      const jugadorId = 1 + Math.floor(azar() * 78);
      const destino = clubesFutbol[Math.floor(azar() * clubesFutbol.length)];
      const precio = 1000 + Math.floor(azar() * 9000);
      if (i % 5 === 0) {
        const otro = 1 + Math.floor(azar() * 78);
        return e.servicios.fichajes.intercambiar({ jugadorAId: jugadorId, jugadorBId: otro === jugadorId ? 1 + (otro % 78) : otro });
      }
      return e.servicios.fichajes.fichar(fichaje(jugadorId, destino, precio));
    });
    const resultados = await Promise.allSettled(peticiones);

    const inesperados = resultados.filter((r) => r.status === 'rejected' && !esErrorDeRegla(r.reason));
    assert.deepEqual(inesperados.map((r) => r.reason.message), []);
    const exitosas = resultados.filter((r) => r.status === 'fulfilled').length;
    assert.ok(exitosas > 3, `solo ${exitosas} operaciones tuvieron exito`);
    assert.equal(e.servicios.fichajes.listar({ pagina: 1, limite: 50 }).paginacion.total, exitosas);
    assert.equal(e.servicios.notificaciones.listar().length, exitosas);
    assert.deepEqual(e.servicios.auditoria.verificar().violaciones, []);
  });
});
