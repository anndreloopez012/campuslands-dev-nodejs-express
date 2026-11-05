import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearFormulasService } from '../../src/services/formulas.service.js';
import { crearCompuestosService } from '../../src/services/compuestos.service.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { ELEMENTOS } from '../../src/constants/quimica.js';

describe('servicios reales trabajando juntos', () => {
  let servicio;

  beforeEach(() => {
    const formulas = crearFormulasService({ elementos: ELEMENTOS });
    servicio = crearCompuestosService({
      repositorio: new MemoryRepository(),
      formulas,
      reloj: () => new Date('2026-05-01T08:00:00.000Z'),
    });
  });

  it('registra compuestos con su masa molar real', () => {
    assert.equal(servicio.crear({ nombre: 'Agua', formula: 'H2O', categoria: 'otro' }).masaMolar, 18.015);
    assert.equal(servicio.crear({ nombre: 'Sal', formula: 'NaCl', categoria: 'sal' }).masaMolar, 58.44);
    assert.equal(servicio.crear({ nombre: 'Sulfato de cobre pentahidratado', formula: 'CuSO4.5H2O', categoria: 'sal' }).masaMolar, 249.677);
  });

  it('lista ordenado por masa molar', () => {
    servicio.crear({ nombre: 'Glucosa', formula: 'C6H12O6', categoria: 'organico' });
    servicio.crear({ nombre: 'Agua', formula: 'H2O', categoria: 'otro' });
    servicio.crear({ nombre: 'Metano', formula: 'CH4', categoria: 'organico' });

    const { data } = servicio.listar({ orden: 'masa' });
    assert.deepEqual(data.map((item) => item.formula), ['CH4', 'H2O', 'C6H12O6']);
  });

  it('una formula invalida no deja nada guardado', () => {
    assert.throws(() => servicio.crear({ nombre: 'Roto', formula: 'Ca(OH', categoria: 'base' }), { codigo: 'FORMULA_INVALIDA' });
    assert.equal(servicio.listar({}).paginacion.total, 0);
  });

  it('detecta duplicados entre llamadas sucesivas', () => {
    servicio.crear({ nombre: 'Agua', formula: 'H2O', categoria: 'otro' });
    assert.throws(() => servicio.crear({ nombre: 'Hielo', formula: 'H2O', categoria: 'otro' }), { codigo: 'FORMULA_DUPLICADA' });
  });
});
