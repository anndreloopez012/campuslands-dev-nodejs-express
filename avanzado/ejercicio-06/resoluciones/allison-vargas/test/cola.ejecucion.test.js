import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TIPOS } from '../src/constants/taller.js';
import { retardoDeReintento } from '../src/domain/backoff.js';
import { SEG } from '../soporte/datos.js';
import { aceite, crearColaDePrueba, frenos, lavado, rechazaCon } from '../soporte/entorno.js';

describe('concurrencia por tipo', () => {
  it('no entrega mas trabajos en proceso que el limite del tipo', () => {
    const { cola } = crearColaDePrueba();
    for (let i = 0; i < 4; i += 1) cola.encolar(frenos());
    assert.equal(cola.reclamar(1, { max: 5 }).length, 1);
    assert.equal(cola.reclamar(2, { max: 5 }).length, 0);
    assert.equal(cola.listar({ estado: 'pendiente' }).length, 3);
  });

  it('libera cupo al completar', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(frenos());
    cola.encolar(frenos());
    const [a] = cola.reclamar(1);
    cola.completar(a.id, a.token);
    const [b] = cola.reclamar(2);
    assert.equal(b.id, 2);
  });

  it('un tipo lleno no frena a los demas', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(frenos());
    cola.encolar(frenos());
    cola.encolar(lavado());
    const reclamados = cola.reclamar(1, { max: 5 });
    assert.deepEqual(reclamados.map((t) => t.tipo), ['frenos', 'lavado']);
  });

  it('filtra por los tipos que sabe atender el mecanico', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(frenos());
    cola.encolar(lavado());
    const reclamados = cola.reclamar(1, { tipos: ['lavado'], max: 5 });
    assert.deepEqual(reclamados.map((t) => t.tipo), ['lavado']);
  });
});

describe('lease y token', () => {
  it('reclamar entrega un token y una fecha de vencimiento', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite());
    const [t] = cola.reclamar(3);
    assert.equal(t.token, 'tok-1');
    assert.equal(t.estado, 'en_proceso');
    assert.equal(t.trabajadorId, 3);
    assert.equal(t.intentos, 1);
    assert.equal(t.venceEn, '2026-11-04T12:00:30.000Z');
    assert.equal('token' in cola.obtener(1), false);
  });

  it('un token equivocado no sirve para completar, fallar ni extender', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite());
    cola.reclamar(1);
    for (const accion of [
      () => cola.completar(1, 'otro'),
      () => cola.fallar(1, 'otro', {}),
      () => cola.extender(1, 'otro'),
    ]) {
      assert.throws(accion, rechazaCon('TOKEN_INVALIDO', { trabajoId: 1 }));
    }
  });

  it('solo se puede responder por un trabajo en proceso', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite());
    assert.throws(() => cola.completar(1, 'x'), rechazaCon('TRABAJO_NO_EN_PROCESO', { estado: 'pendiente' }));
    const [t] = cola.reclamar(1);
    cola.completar(1, t.token);
    assert.throws(() => cola.completar(1, t.token), rechazaCon('TRABAJO_NO_EN_PROCESO', { estado: 'completada' }));
  });

  it('si el lease vence el trabajo vuelve a la cola con espera y el token viejo queda invalido', () => {
    const { cola, avanzar } = crearColaDePrueba();
    cola.encolar(aceite());
    const [viejo] = cola.reclamar(1);
    avanzar(30 * SEG);
    const t = cola.obtener(1);
    assert.equal(t.estado, 'programada');
    assert.equal(t.trabajadorId, null);
    assert.equal(t.ultimoError, 'lease expirado sin respuesta del mecanico');
    assert.throws(() => cola.completar(1, viejo.token), rechazaCon('TRABAJO_NO_EN_PROCESO'));
    avanzar(1 * SEG);
    const [nuevo] = cola.reclamar(2);
    assert.equal(nuevo.intentos, 2);
    assert.notEqual(nuevo.token, viejo.token);
    assert.throws(() => cola.completar(1, viejo.token), rechazaCon('TOKEN_INVALIDO'));
    assert.equal(cola.completar(1, nuevo.token).estado, 'completada');
  });

  it('el lease que vence en el ultimo intento deja el trabajo muerto', () => {
    const { cola, avanzar } = crearColaDePrueba();
    cola.encolar(aceite({ maxIntentos: 1 }));
    cola.reclamar(1);
    avanzar(30 * SEG);
    assert.equal(cola.obtener(1).estado, 'muerta');
  });

  it('extender corre el vencimiento hasta el maximo de extensiones', () => {
    const { cola, avanzar } = crearColaDePrueba();
    cola.encolar(aceite());
    const [t] = cola.reclamar(1);
    for (let i = 1; i <= 3; i += 1) {
      avanzar(20 * SEG);
      assert.equal(cola.extender(1, t.token).extensiones, i);
    }
    assert.throws(() => cola.extender(1, t.token), rechazaCon('EXTENSIONES_AGOTADAS', { maximo: 3 }));
    assert.equal(cola.obtener(1).venceEn, '2026-11-04T12:01:30.000Z');
    avanzar(29 * SEG);
    assert.equal(cola.obtener(1).estado, 'en_proceso');
  });

  it('no se puede extender un lease ya vencido', () => {
    const { cola, avanzar } = crearColaDePrueba();
    cola.encolar(aceite());
    const [t] = cola.reclamar(1);
    avanzar(30 * SEG);
    assert.throws(() => cola.extender(1, t.token), rechazaCon('TRABAJO_NO_EN_PROCESO'));
  });
});

describe('reintentos con espera creciente', () => {
  it('calcula la espera como base por dos elevado al intento, con tope', () => {
    const config = { backoffBaseMs: 1000, backoffMaxMs: 5000 };
    assert.deepEqual([1, 2, 3, 4, 5].map((n) => retardoDeReintento(n, config)), [1000, 2000, 4000, 5000, 5000]);
  });

  it('un fallo reprograma el trabajo con la espera del tipo', () => {
    const { cola, avanzar } = crearColaDePrueba();
    cola.encolar(frenos());
    const [t] = cola.reclamar(1);
    const fallido = cola.fallar(1, t.token, { mensaje: 'pastilla rota' });
    assert.equal(fallido.estado, 'programada');
    assert.equal(fallido.disponibleEn, '2026-11-04T12:00:02.000Z');
    assert.equal(fallido.ultimoError, 'pastilla rota');
    avanzar(1999);
    assert.equal(cola.reclamar(1).length, 0);
    avanzar(1);
    assert.equal(cola.reclamar(1).length, 1);
  });

  it('la espera se duplica en cada intento y al agotarse queda muerto', () => {
    const { cola, avanzar } = crearColaDePrueba();
    cola.encolar(frenos());
    const esperas = [];
    for (let i = 0; i < 3; i += 1) {
      const [t] = cola.reclamar(1);
      const estado = cola.fallar(1, t.token, { mensaje: `fallo ${i + 1}` });
      if (estado.estado === 'muerta') break;
      esperas.push(Date.parse(estado.disponibleEn) - Date.parse('2026-11-04T12:00:00.000Z') - esperas.reduce((a, b) => a + b, 0));
      avanzar(esperas.at(-1));
    }
    assert.deepEqual(esperas, [2000, 4000]);
    const final = cola.obtener(1);
    assert.equal(final.estado, 'muerta');
    assert.equal(final.intentos, 3);
    assert.equal(final.ultimoError, 'fallo 3');
  });

  it('un fallo definitivo mata el trabajo sin importar los intentos', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite());
    const [t] = cola.reclamar(1);
    assert.equal(cola.fallar(1, t.token, { mensaje: 'chasis roto', definitivo: true }).estado, 'muerta');
  });

  it('usa los limites declarados para cada tipo', () => {
    for (const config of Object.values(TIPOS)) {
      assert.ok(config.backoffBaseMs <= config.backoffMaxMs);
      assert.ok(config.maxIntentos >= 1);
      assert.ok(config.concurrencia >= 1);
    }
  });
});

describe('cancelar', () => {
  it('cancela trabajos pendientes, programados o bloqueados', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite());
    cola.encolar(aceite({ retrasoMs: 5000 }));
    cola.encolar(lavado({ dependeDe: [1] }));
    for (const id of [3, 2, 1]) assert.equal(cola.cancelar(id).estado, 'cancelada');
  });

  it('no cancela un trabajo en proceso ni uno terminado', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite());
    const [t] = cola.reclamar(1);
    assert.throws(() => cola.cancelar(1), rechazaCon('TRABAJO_EN_PROCESO'));
    cola.completar(1, t.token);
    assert.throws(() => cola.cancelar(1), rechazaCon('TRABAJO_FINALIZADO', { estado: 'completada' }));
    assert.throws(() => cola.cancelar(40), rechazaCon('TRABAJO_NO_ENCONTRADO'));
  });
});

describe('estadisticas', () => {
  it('resume estados, tipos, esperas y reintentos', () => {
    const { cola, avanzar } = crearColaDePrueba();
    assert.equal(cola.estadisticas().esperaPromedioMs, null);
    assert.equal(cola.estadisticas().pendienteMasAntiguoMs, null);
    cola.encolar(aceite());
    cola.encolar(frenos());
    cola.encolar(frenos());
    avanzar(4 * SEG);
    const [a] = cola.reclamar(1, { tipos: ['cambio_aceite'] });
    const [b] = cola.reclamar(2, { tipos: ['frenos'] });
    cola.completar(a.id, a.token);
    cola.fallar(b.id, b.token, { mensaje: 'x' });
    const stats = cola.estadisticas();
    assert.equal(stats.total, 3);
    assert.equal(stats.porEstado.completada, 1);
    assert.equal(stats.porEstado.programada, 1);
    assert.equal(stats.porEstado.pendiente, 1);
    assert.equal(stats.porTipo.frenos.pendientes, 1);
    assert.equal(stats.porTipo.frenos.limite, 1);
    assert.equal(stats.porTipo.cambio_aceite.completadas, 1);
    assert.equal(stats.esperaPromedioMs, 4000);
    assert.equal(stats.pendienteMasAntiguoMs, 4000);
    assert.equal(stats.reintentos, 0);
    avanzar(2 * SEG);
    const [c] = cola.reclamar(2, { tipos: ['frenos'] });
    cola.completar(c.id, c.token);
    const [otra] = cola.reclamar(2, { tipos: ['frenos'] });
    assert.equal(otra.id, b.id);
    assert.equal(cola.estadisticas().reintentos, 1);
  });
});
