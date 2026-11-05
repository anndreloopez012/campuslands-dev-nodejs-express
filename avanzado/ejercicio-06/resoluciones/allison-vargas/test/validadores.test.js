import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validarTrabajoNuevo } from '../src/validators/trabajo.js';
import { validarOrdenNueva } from '../src/validators/orden.js';
import { ORDEN_BASE } from '../soporte/entorno.js';

const campos = (accion) => {
  try {
    accion();
  } catch (error) {
    return error.detalles.map((e) => e.campo).sort();
  }
  return [];
};
const opciones = { permitirSimulaciones: true };

describe('validacion de trabajos', () => {
  it('el body debe ser un objeto', () => {
    assert.deepEqual(campos(() => validarTrabajoNuevo([], opciones)), ['cuerpo']);
    assert.deepEqual(campos(() => validarTrabajoNuevo(null, opciones)), ['cuerpo']);
  });

  it('valida cada carga segun el tipo', () => {
    assert.deepEqual(campos(() => validarTrabajoNuevo({ tipo: 'cambio_aceite', carga: { litros: 9, sintetico: 'si' } }, opciones)), ['carga.litros', 'carga.sintetico']);
    assert.deepEqual(campos(() => validarTrabajoNuevo({ tipo: 'afinacion', carga: { cilindrada: 10 } }, opciones)), ['carga.cilindrada']);
    assert.deepEqual(campos(() => validarTrabajoNuevo({ tipo: 'electrica', carga: {} }, opciones)), ['carga.componente']);
    assert.deepEqual(campos(() => validarTrabajoNuevo({ tipo: 'diagnostico', carga: { sintomas: [] } }, opciones)), ['carga.sintomas']);
    assert.deepEqual(campos(() => validarTrabajoNuevo({ tipo: 'diagnostico', carga: { sintomas: ['x', 'ruido_motor', 'ruido_motor'] } }, opciones)).length > 0, true);
    assert.deepEqual(campos(() => validarTrabajoNuevo({ tipo: 'lavado', carga: 5 }, opciones)), ['carga']);
    assert.deepEqual(campos(() => validarTrabajoNuevo({ tipo: 'lavado', carga: { colgar: 1, fallosSimulados: 9 } }, opciones)), ['carga.colgar', 'carga.fallosSimulados']);
  });

  it('valida dependencias, retraso e intentos', () => {
    assert.deepEqual(campos(() => validarTrabajoNuevo({ tipo: 'lavado', dependeDe: 'x' }, opciones)), ['dependeDe']);
    assert.deepEqual(campos(() => validarTrabajoNuevo({ tipo: 'lavado', dependeDe: [0, 'a'] }, opciones)), ['dependeDe[0]', 'dependeDe[1]']);
    assert.deepEqual(campos(() => validarTrabajoNuevo({ tipo: 'lavado', dependeDe: Array.from({ length: 11 }, (_, i) => i + 1) }, opciones)), ['dependeDe']);
    assert.deepEqual(campos(() => validarTrabajoNuevo({ tipo: 'lavado', retrasoMs: -1, maxIntentos: 99 }, opciones)), ['maxIntentos', 'retrasoMs']);
  });

  it('acepta un trabajo completo y normaliza la entrada', () => {
    const datos = validarTrabajoNuevo({ tipo: 'frenos', carga: { eje: 'ambos' }, prioridad: 0, dependeDe: [2, 3], claveUnica: 'a-b' }, opciones);
    assert.deepEqual(datos, { tipo: 'frenos', carga: { eje: 'ambos' }, prioridad: 0, dependeDe: [2, 3], claveUnica: 'a-b' });
  });
});

describe('validacion de ordenes', () => {
  it('acepta la orden base y aplica los valores por defecto', () => {
    const datos = validarOrdenNueva(ORDEN_BASE, opciones);
    assert.equal(datos.incluirLavado, true);
    assert.equal(datos.prioridad, 2);
    assert.equal(datos.moto.placa, 'M123ABC');
  });

  it('rechaza formas incorrectas en cada nivel', () => {
    assert.deepEqual(campos(() => validarOrdenNueva('x', opciones)), ['cuerpo']);
    assert.ok(campos(() => validarOrdenNueva({ ...ORDEN_BASE, moto: undefined }, opciones)).includes('moto'));
    assert.ok(campos(() => validarOrdenNueva({ ...ORDEN_BASE, moto: 'x' }, opciones)).includes('moto'));
    assert.ok(campos(() => validarOrdenNueva({ ...ORDEN_BASE, servicios: 'x' }, opciones)).includes('servicios'));
    assert.ok(campos(() => validarOrdenNueva({ ...ORDEN_BASE, servicios: undefined }, opciones)).includes('servicios'));
    assert.ok(campos(() => validarOrdenNueva({ ...ORDEN_BASE, servicios: [] }, opciones)).includes('servicios'));
    assert.ok(campos(() => validarOrdenNueva({ ...ORDEN_BASE, servicios: ['x'] }, opciones)).includes('servicios[0]'));
    assert.ok(campos(() => validarOrdenNueva({ ...ORDEN_BASE, incluirLavado: 'no' }, opciones)).includes('incluirLavado'));
    assert.ok(campos(() => validarOrdenNueva({ ...ORDEN_BASE, prioridad: 7 }, opciones)).includes('prioridad'));
  });
});
