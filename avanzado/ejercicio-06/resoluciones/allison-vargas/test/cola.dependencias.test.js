import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SEG } from '../soporte/datos.js';
import { aceite, crearColaDePrueba, diagnostico, frenos, lavado, rechazaCon } from '../soporte/entorno.js';

function matar(cola, tipo = 1) {
  const [t] = cola.reclamar(1);
  cola.fallar(t.id, t.token, { mensaje: 'sin remedio', definitivo: true });
  return tipo;
}

describe('dependencias', () => {
  it('un trabajo bloqueado se libera cuando termina su dependencia', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(diagnostico());
    cola.encolar(frenos({ dependeDe: [1] }));
    const reclamados = cola.reclamar(1, { max: 5 });
    assert.equal(reclamados.length, 1);
    assert.equal(cola.obtener(2).estado, 'bloqueada');
    cola.completar(1, reclamados[0].token);
    assert.equal(cola.obtener(2).estado, 'pendiente');
  });

  it('espera todas sus dependencias', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite());
    cola.encolar(aceite());
    cola.encolar(lavado({ dependeDe: [1, 2] }));
    const [a, b] = cola.reclamar(1, { max: 2 });
    cola.completar(a.id, a.token);
    assert.equal(cola.obtener(3).estado, 'bloqueada');
    cola.completar(b.id, b.token);
    assert.equal(cola.obtener(3).estado, 'pendiente');
  });

  it('respeta el retraso propio una vez desbloqueado', () => {
    const { cola, avanzar } = crearColaDePrueba();
    cola.encolar(aceite());
    cola.encolar(lavado({ dependeDe: [1], retrasoMs: 10 * SEG }));
    const [a] = cola.reclamar(1);
    cola.completar(a.id, a.token);
    assert.equal(cola.obtener(2).estado, 'programada');
    avanzar(10 * SEG);
    assert.equal(cola.obtener(2).estado, 'pendiente');
  });

  it('cancela en cascada lo que depende de un trabajo muerto', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(diagnostico());
    cola.encolar(frenos({ dependeDe: [1] }));
    cola.encolar(lavado({ dependeDe: [2] }));
    matar(cola);
    assert.equal(cola.obtener(1).estado, 'muerta');
    const segundo = cola.obtener(2);
    assert.equal(segundo.estado, 'cancelada');
    assert.equal(segundo.canceladaPor, 1);
    assert.equal(cola.obtener(3).estado, 'cancelada');
    assert.equal(cola.obtener(3).canceladaPor, 2);
  });

  it('cancela en cascada lo que depende de un trabajo cancelado a mano', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite({ retrasoMs: 5000 }));
    cola.encolar(lavado({ dependeDe: [1] }));
    cola.cancelar(1);
    assert.equal(cola.obtener(2).estado, 'cancelada');
    assert.equal(cola.obtener(2).canceladaPor, 1);
  });

  it('una cancelacion manual no se confunde con una cascada', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite());
    cola.cancelar(1);
    assert.equal(cola.obtener(1).canceladaPor, null);
  });
});

describe('cola de muertos', () => {
  it('reencolar devuelve el trabajo a la cola con intentos en cero', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite());
    matar(cola);
    const t = cola.reencolar(1);
    assert.equal(t.estado, 'pendiente');
    assert.equal(t.intentos, 0);
    const [nuevo] = cola.reclamar(2);
    assert.equal(nuevo.intentos, 1);
  });

  it('restaura los dependientes que se cancelaron por su culpa', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(diagnostico());
    cola.encolar(frenos({ dependeDe: [1] }));
    cola.encolar(lavado({ dependeDe: [2] }));
    cola.encolar(aceite({ retrasoMs: 5000 }));
    cola.encolar(lavado({ dependeDe: [4] }));
    cola.cancelar(5);
    matar(cola);
    cola.reencolar(1);
    assert.equal(cola.obtener(2).estado, 'bloqueada');
    assert.equal(cola.obtener(3).estado, 'bloqueada');
    assert.equal(cola.obtener(2).canceladaPor, null);
    assert.equal(cola.obtener(5).estado, 'cancelada');
    const [t] = cola.reclamar(1);
    cola.completar(t.id, t.token);
    assert.equal(cola.obtener(2).estado, 'pendiente');
    assert.equal(cola.obtener(3).estado, 'bloqueada');
  });

  it('no restaura lo que alguien cancelo a mano', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(diagnostico());
    cola.encolar(frenos({ dependeDe: [1] }));
    cola.cancelar(2);
    matar(cola);
    cola.reencolar(1);
    assert.equal(cola.obtener(2).estado, 'cancelada');
  });

  it('solo se reencolan trabajos muertos', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite());
    assert.throws(() => cola.reencolar(1), rechazaCon('TRABAJO_NO_MUERTO', { estado: 'pendiente' }));
    assert.throws(() => cola.reencolar(8), rechazaCon('TRABAJO_NO_ENCONTRADO'));
  });

  it('el historial conserva la muerte y la reencolada', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar(aceite());
    matar(cola);
    cola.reencolar(1);
    assert.deepEqual(
      cola.obtener(1).historial.map((h) => h.evento),
      ['creada', 'encolada', 'reclamada', 'muerta', 'reencolada'],
    );
  });
});
