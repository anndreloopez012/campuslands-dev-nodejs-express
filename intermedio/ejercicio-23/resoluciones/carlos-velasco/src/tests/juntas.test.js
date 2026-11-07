const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { evaluarJunta, clasificar } = require('../services/weld.service');

describe('evaluarJunta', () => {
  it('acepta una junta de alta calidad y calcula su resistencia', () => {
    const resultado = evaluarJunta({ tipo: 'butt', penetracion_pct: 95, porosidad: 'baja' });
    assert.equal(resultado.valida, true);
    assert.equal(resultado.resistencia_mpa, Math.round(480 * 0.95));
  });

  it('rechaza juntas con penetracion menor al 80%', () => {
    const resultado = evaluarJunta({ tipo: 'esquina', penetracion_pct: 55, porosidad: 'baja' });
    assert.equal(resultado.valida, false);
    assert.equal(resultado.motivo, 'penetracion_insuficiente');
  });

  it('rechaza juntas con porosidad alta aunque la penetracion sea buena', () => {
    const resultado = evaluarJunta({ tipo: 'traslape', penetracion_pct: 90, porosidad: 'alta' });
    assert.equal(resultado.valida, false);
    assert.equal(resultado.motivo, 'porosidad_alta');
  });

  it('valida las entradas antes de evaluar', () => {
    assert.deepEqual(evaluarJunta({ tipo: 'madera', penetracion_pct: 90, porosidad: 'baja' }), {
      valida: false,
      motivo: 'tipo_invalido'
    });
    assert.equal(evaluarJunta({ tipo: 'butt', penetracion_pct: 150, porosidad: 'baja' }).motivo, 'penetracion_invalida');
    assert.equal(evaluarJunta({ tipo: 'butt', penetracion_pct: 90, porosidad: 'media' }).valida, true);
  });
});

describe('clasificar', () => {
  it('asigna clase estructural desde 460 MPa', () => {
    assert.equal(clasificar(480), 'estructural');
    assert.equal(clasificar(460), 'estructural');
  });

  it('asigna clase industrial entre 350 y 460 MPa', () => {
    assert.equal(clasificar(400), 'industrial');
  });

  it('asigna clase ligera por debajo de 350 MPa', () => {
    assert.equal(clasificar(200), 'ligera');
  });

  it('lanza TypeError para entradas que no son numeros positivos', () => {
    assert.throws(() => clasificar('alto'), TypeError);
    assert.throws(() => clasificar(-5), TypeError);
  });
});
