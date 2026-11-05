import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GENESIS, calcularHash, canonico, diferencias, verificarCadena,
} from '../src/auditoria/cadena.js';
import { crearRegistroAuditoria } from '../src/auditoria/registro.js';

const reloj = () => new Date('2026-11-05T12:00:00.000Z');
const actor = { id: 1, rol: 'admin' };

function registroCon(cantidad) {
  const registro = crearRegistroAuditoria({ reloj });
  for (let i = 1; i <= cantidad; i += 1) {
    registro.registrar({
      actor, accion: 'cita.editar', recurso: { tipo: 'cita', id: i }, antes: { precio: i }, despues: { precio: i + 1 },
    });
  }
  return registro;
}

describe('cadena de hashes', () => {
  it('el json canonico no depende del orden de las claves', () => {
    assert.equal(canonico({ b: 1, a: [{ d: 2, c: null }], x: undefined }), '{"a":[{"c":null,"d":2}],"b":1}');
    assert.equal(calcularHash({ a: 1, b: 2 }), calcularHash({ b: 2, a: 1 }));
    assert.equal(calcularHash({ a: 1, hash: 'x' }), calcularHash({ a: 1 }));
  });

  it('cada entrada enlaza con la anterior desde el genesis', () => {
    const entradas = registroCon(3).todas();
    assert.equal(entradas[0].hashAnterior, GENESIS);
    assert.equal(entradas[1].hashAnterior, entradas[0].hash);
    assert.deepEqual(verificarCadena(entradas), { integro: true, total: 3, ultimoHash: entradas[2].hash });
  });

  it('detecta contenido modificado, entradas borradas y enlaces rotos', () => {
    const entradas = registroCon(4).todas().map((e) => structuredClone(e));
    const modificada = entradas.map((e) => ({ ...e }));
    modificada[1].actor = { id: 99, rol: 'admin' };
    assert.deepEqual(verificarCadena(modificada), {
      integro: false, total: 4, secuencia: 2, problema: 'el contenido fue modificado',
    });
    const sinUna = entradas.filter((e) => e.secuencia !== 3);
    assert.equal(verificarCadena(sinUna).problema, 'falta una entrada o cambio el orden');
    const recalculada = entradas.map((e) => ({ ...e }));
    recalculada[2].cambios = [];
    recalculada[2].hash = calcularHash(recalculada[2]);
    assert.deepEqual(verificarCadena(recalculada), {
      integro: false, total: 4, secuencia: 4, problema: 'no enlaza con la entrada anterior',
    });
  });

  it('calcula diferencias por campo, incluso anidadas', () => {
    assert.deepEqual(diferencias(
      { precio: 1, zona: 'brazo', meta: { a: 1, b: [1] } },
      { precio: 2, zona: 'brazo', meta: { a: 1, b: [1, 2] }, nuevo: true },
    ), [
      { campo: 'meta.b', antes: [1], despues: [1, 2] },
      { campo: 'nuevo', antes: null, despues: true },
      { campo: 'precio', antes: 1, despues: 2 },
    ]);
  });
});

describe('registro de auditoria', () => {
  it('las entradas quedan congeladas', () => {
    const [entrada] = registroCon(1).todas();
    assert.throws(() => { entrada.resultado = 'otro'; }, TypeError);
    assert.throws(() => { entrada.cambios[0].despues = 0; }, TypeError);
  });

  it('no copia datos sensibles, solo deja constancia de que cambiaron', () => {
    const registro = crearRegistroAuditoria({ reloj });
    const e = registro.registrar({
      actor,
      accion: 'cliente.editar',
      recurso: { tipo: 'cliente', id: 1 },
      antes: { nombre: 'Ana', telefono: '+569111', datos: { alergias: [] } },
      despues: { nombre: 'Ana Paz', telefono: '+569222', datos: { alergias: ['latex'] } },
    });
    assert.deepEqual(e.cambios, [
      { campo: 'datos.alergias', antes: '[PROTEGIDO]', despues: '[PROTEGIDO]', protegido: true },
      { campo: 'nombre', antes: 'Ana', despues: 'Ana Paz' },
      { campo: 'telefono', antes: '[PROTEGIDO]', despues: '[PROTEGIDO]', protegido: true },
    ]);
    assert.equal(JSON.stringify(registro.todas()).includes('latex'), false);
  });

  it('si no se puede escribir no agrega nada y avisa con AUDITORIA_NO_DISPONIBLE', () => {
    let falla = true;
    const registro = crearRegistroAuditoria({ reloj, alEscribir: () => { if (falla) throw new Error('disco lleno'); } });
    assert.throws(() => registro.registrar({ actor, accion: 'x.y', recurso: { tipo: 'x', id: 1 } }), (e) => e.codigo === 'AUDITORIA_NO_DISPONIBLE' && e.cause.message === 'disco lleno');
    assert.equal(registro.total, 0);
    falla = false;
    assert.equal(registro.registrar({ actor, accion: 'x.y', recurso: { tipo: 'x', id: 1 } }).secuencia, 1);
    assert.throws(() => registro.registrar({
      actor, accion: 'x.y', recurso: {}, resultado: 'raro',
    }), TypeError);
  });

  it('consulta con filtros y pagina con cursor', () => {
    const registro = registroCon(5);
    registro.registrar({
      actor: { id: 2, rol: 'recepcion' }, accion: 'cita.crear', recurso: { tipo: 'cita', id: 9 }, resultado: 'denegado',
    });
    assert.equal(registro.consultar({ actorId: 2 }).data.length, 1);
    assert.equal(registro.consultar({ accion: 'cita' }).data.length, 6);
    assert.equal(registro.consultar({ resultado: 'denegado' }).data[0].secuencia, 6);
    const primera = registro.consultar({ limite: 4 });
    assert.equal(primera.siguiente, 4);
    const segunda = registro.consultar({ limite: 4, despuesDe: primera.siguiente });
    assert.deepEqual(segunda.data.map((e) => e.secuencia), [5, 6]);
    assert.equal(segunda.siguiente, null);
  });
});
