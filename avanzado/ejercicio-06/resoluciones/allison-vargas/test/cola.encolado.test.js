import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MIN, SEG } from '../soporte/datos.js';
import { aceite, crearColaDePrueba, frenos, lavado, rechazaCon } from '../soporte/entorno.js';

describe('encolar', () => {
  it('un trabajo normal queda pendiente y listo para reclamar', () => {
    const { cola } = crearColaDePrueba();
    const { trabajo, duplicado } = cola.encolar(aceite());
    assert.equal(duplicado, false);
    assert.equal(trabajo.id, 1);
    assert.equal(trabajo.estado, 'pendiente');
    assert.equal(trabajo.prioridad, 2);
    assert.equal(trabajo.maxIntentos, 3);
    assert.equal(trabajo.disponibleEn, '2026-11-04T12:00:00.000Z');
  });

  it('con retraso queda programado y pasa a pendiente cuando llega la hora', () => {
    const { cola, avanzar } = crearColaDePrueba();
    cola.encolar(aceite({ retrasoMs: 10 * SEG }));
    assert.equal(cola.obtener(1).estado, 'programada');
    avanzar(9 * SEG);
    assert.equal(cola.obtener(1).estado, 'programada');
    avanzar(1 * SEG);
    assert.equal(cola.obtener(1).estado, 'pendiente');
  });

  it('con una dependencia sin terminar queda bloqueado', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite());
    const { trabajo } = cola.encolar(lavado({ dependeDe: [1] }));
    assert.equal(trabajo.estado, 'bloqueada');
    assert.deepEqual(trabajo.dependeDe, [1]);
  });

  it('respeta el maximo de intentos propio', () => {
    const { cola } = crearColaDePrueba();
    assert.equal(cola.encolar(aceite({ maxIntentos: 7 })).trabajo.maxIntentos, 7);
  });

  it('guarda una copia de la carga', () => {
    const { cola } = crearColaDePrueba();
    const carga = { litros: 2 };
    cola.encolar({ tipo: 'cambio_aceite', carga });
    carga.litros = 99;
    assert.equal(cola.obtener(1).carga.litros, 2);
  });

  it('rechaza dependencias inexistentes o fallidas', () => {
    const { cola } = crearColaDePrueba();
    assert.throws(() => cola.encolar(lavado({ dependeDe: [9] })), rechazaCon('DEPENDENCIA_NO_ENCONTRADA', { trabajoId: 9 }));
    cola.encolar(aceite());
    cola.cancelar(1);
    assert.throws(
      () => cola.encolar(lavado({ dependeDe: [1] })),
      rechazaCon('DEPENDENCIA_FALLIDA', { trabajoId: 1, estado: 'cancelada' }),
    );
  });

  it('una dependencia ya completada no bloquea', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite());
    const [reclamado] = cola.reclamar(1);
    cola.completar(1, reclamado.token, { costo: 1 });
    assert.equal(cola.encolar(lavado({ dependeDe: [1] })).trabajo.estado, 'pendiente');
  });
});

describe('claveUnica', () => {
  it('evita duplicados mientras el trabajo siga activo', () => {
    const { cola } = crearColaDePrueba();
    const primero = cola.encolar(aceite({ claveUnica: 'orden-1-aceite' }));
    const segundo = cola.encolar(aceite({ claveUnica: 'orden-1-aceite' }));
    assert.equal(segundo.duplicado, true);
    assert.equal(segundo.trabajo.id, primero.trabajo.id);
    assert.equal(cola.listar().length, 1);
  });

  it('se puede reutilizar cuando el trabajo se completo o se cancelo', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite({ claveUnica: 'k1' }));
    const [reclamado] = cola.reclamar(1);
    cola.completar(1, reclamado.token);
    assert.equal(cola.encolar(aceite({ claveUnica: 'k1' })).duplicado, false);
    cola.cancelar(2);
    assert.equal(cola.encolar(aceite({ claveUnica: 'k1' })).trabajo.id, 3);
  });

  it('un trabajo muerto sigue reservando la clave', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite({ claveUnica: 'k2', maxIntentos: 1 }));
    const [reclamado] = cola.reclamar(1);
    cola.fallar(1, reclamado.token, { mensaje: 'x' });
    assert.equal(cola.obtener(1).estado, 'muerta');
    const repetido = cola.encolar(aceite({ claveUnica: 'k2' }));
    assert.equal(repetido.duplicado, true);
    assert.equal(repetido.trabajo.estado, 'muerta');
  });
});

describe('orden de atencion', () => {
  it('atiende por prioridad y, dentro de cada una, en orden de llegada', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite({ prioridad: 3 }));
    cola.encolar(aceite({ prioridad: 2 }));
    cola.encolar(aceite({ prioridad: 0 }));
    cola.encolar(aceite({ prioridad: 2 }));
    cola.encolar(aceite({ prioridad: 1 }));
    const orden = [];
    for (let i = 0; i < 5; i += 1) {
      const [t] = cola.reclamar(1, { max: 1 });
      orden.push(t.id);
      cola.completar(t.id, t.token);
    }
    assert.deepEqual(orden, [3, 5, 2, 4, 1]);
  });

  it('un trabajo programado que vence antes pasa por delante de uno que llego antes', () => {
    const { cola, avanzar } = crearColaDePrueba();
    cola.encolar(aceite({ retrasoMs: 5 * MIN }));
    cola.encolar(aceite({ retrasoMs: 1 * MIN }));
    avanzar(6 * MIN);
    const [primero] = cola.reclamar(1);
    assert.equal(primero.id, 2);
  });

  it('el historial deja constancia de cada paso', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(frenos());
    const [t] = cola.reclamar(7);
    cola.completar(1, t.token, { costo: 180 });
    const historial = cola.obtener(1).historial;
    assert.deepEqual(historial.map((h) => h.evento), ['creada', 'encolada', 'reclamada', 'completada']);
    assert.deepEqual(historial.map((h) => h.n), [1, 2, 3, 4]);
    assert.equal(historial[2].trabajadorId, 7);
  });

  it('inexistente es un 404 de dominio', () => {
    const { cola } = crearColaDePrueba();
    assert.throws(() => cola.obtener(5), rechazaCon('TRABAJO_NO_ENCONTRADO', { trabajoId: 5 }));
  });
});
