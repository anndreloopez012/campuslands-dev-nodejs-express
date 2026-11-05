import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearMotor, validarRoles } from '../src/autorizacion/motor.js';
import { CONDICIONES, PROHIBICIONES, ROLES } from '../src/autorizacion/politicas.js';

const motor = crearMotor({ roles: ROLES, condiciones: CONDICIONES, prohibiciones: PROHIBICIONES });

const sofia = { id: 1, roles: ['alumno'], licencia: null };
const diego = { id: 2, roles: ['paracaidista'], licencia: 'B' };
const camila = {
  id: 3, roles: ['instructor'], licencia: 'D', certificaciones: ['instructor'], alumnos: [1],
};
const martin = { id: 4, roles: ['piloto', 'paracaidista'], licencia: 'A' };
const elena = { id: 7, roles: ['admin'], licencia: null };

describe('definicion de roles', () => {
  it('detecta herencia desconocida, circular y permisos mal escritos', () => {
    assert.throws(() => validarRoles({ a: { hereda: ['x'], permisos: [] } }), /desconocido: x/);
    assert.throws(() => validarRoles({
      a: { hereda: ['b'], permisos: [] }, b: { hereda: ['c'], permisos: [] }, c: { hereda: ['a'], permisos: [] },
    }), /circular: a -> b -> c -> a/);
    assert.throws(() => validarRoles({ a: { permisos: ['Saltos-Ver'] } }), /mal escrito/);
    assert.equal(validarRoles(ROLES), ROLES);
  });

  it('expande la herencia y une los permisos de varios roles', () => {
    assert.deepEqual(motor.rolesEfectivos(elena), ['admin', 'alumno', 'instructor', 'jefe_zona', 'paracaidista']);
    assert.deepEqual(motor.rolesEfectivos(martin), ['alumno', 'paracaidista', 'piloto']);
    assert.ok(motor.permisos(martin).includes('vuelos:despegar'));
    assert.ok(motor.permisos(martin).includes('equipos:reservar'));
    assert.equal(motor.permisos(sofia).includes('equipos:reservar'), false);
    assert.deepEqual(motor.rolesEfectivos({ roles: ['inventado'] }), []);
  });
});

describe('decisiones', () => {
  it('sin un rol que otorgue el permiso se niega en la etapa de rol', () => {
    const d = motor.decidir(sofia, 'vuelos:crear', null);
    assert.deepEqual(d, {
      accion: 'vuelos:crear', usuarioId: 1, permitido: false, motivo: 'ninguno de tus roles otorga este permiso', etapa: 'rol',
    });
  });

  it('las condiciones revisan licencia segun el tipo de salto', () => {
    assert.equal(motor.puede(sofia, 'saltos:crear', { tipo: 'tandem' }), true);
    assert.equal(motor.decidir(sofia, 'saltos:crear', { tipo: 'libre' }).motivo, 'un salto libre exige licencia A o superior');
    assert.equal(motor.puede(diego, 'saltos:crear', { tipo: 'libre' }), true);
    assert.equal(motor.decidir(diego, 'saltos:crear', { tipo: 'wingsuit' }).etapa, 'condicion');
    assert.equal(motor.decidir(diego, 'saltos:crear', { tipo: 'aff' }).motivo, 'con licencia ya no corresponde un salto aff');
  });

  it('el rol no basta: el admin hereda aprobar pero no tiene la certificacion', () => {
    const d = motor.decidir(elena, 'saltos:aprobar', { saltadorId: 1 }, { saltador: sofia });
    assert.equal(d.permitido, false);
    assert.deepEqual(d.otorgadoPor, ['admin']);
    assert.equal(d.motivo, 'aprobar saltos exige la certificacion de instructor');
  });

  it('separacion de funciones y alumno asignado', () => {
    assert.equal(motor.decidir(camila, 'saltos:aprobar', { saltadorId: 3 }, { saltador: camila }).motivo, 'nadie puede aprobar su propio salto');
    assert.equal(motor.puede(camila, 'saltos:aprobar', { saltadorId: 1 }, { saltador: sofia }), true);
    const lucas = { id: 6, roles: ['alumno'], licencia: null };
    assert.equal(motor.decidir(camila, 'saltos:aprobar', { saltadorId: 6 }, { saltador: lucas }).motivo, 'los saltos de un alumno solo los aprueba su instructor asignado');
    assert.equal(motor.puede(camila, 'saltos:aprobar', { saltadorId: 2 }, { saltador: diego }), true);
  });

  it('las prohibiciones ganan sobre cualquier rol', () => {
    const clima = { clima: { suspendido: true } };
    const d = motor.decidir(camila, 'saltos:crear', { tipo: 'libre' }, clima);
    assert.deepEqual([d.permitido, d.etapa, d.motivo], [false, 'prohibicion', 'los saltos estan suspendidos por clima']);
    assert.equal(motor.puede({ ...diego, suspendido: true }, 'saltos:crear', { tipo: 'libre' }), false);
    assert.equal(motor.puede(camila, 'saltos:ver', { saltadorId: 1 }, clima), true);
  });

  it('exigir lanza PROHIBIDO con la accion y el motivo', () => {
    assert.throws(() => motor.exigir(martin, 'vuelos:despegar', { pilotoId: 10 }), (e) => e.codigo === 'PROHIBIDO'
      && e.message === 'No puedes vuelos:despegar: solo el piloto asignado puede despegar');
    assert.equal(motor.exigir(martin, 'vuelos:despegar', { pilotoId: 4 }).permitido, true);
  });
});
