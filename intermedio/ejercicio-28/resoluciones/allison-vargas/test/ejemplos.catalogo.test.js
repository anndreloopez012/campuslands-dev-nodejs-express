import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PASOS, SECCIONES } from '../src/ejemplos/catalogo.js';
import { ALEATORIO, variablesDelPaso } from '../src/ejemplos/plantilla.js';
import { listarRutas } from '../src/ejemplos/introspeccion.js';
import { crearApp } from '../src/app.js';
import { BASE_RUTAS } from '../src/constants/rutas.js';

const METODOS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const patronDe = (ruta) => new RegExp(`^${ruta.replace(/\{[^}]+\}/g, '[^/]+')}$`);

const rutaLimpia = (ruta) => {
  const sinConsulta = ruta.split('?')[0].replace(/\{[^}]+\}/g, '1');
  return sinConsulta.length > 1 ? sinConsulta.replace(/\/$/, '') : sinConsulta;
};

describe('catalogo de ejemplos', () => {
  const registradas = listarRutas(crearApp(), BASE_RUTAS);

  it('tiene ids unicos y bien formados', () => {
    const ids = PASOS.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) assert.match(id, /^[a-z][A-Za-z0-9]*$/);
  });

  it('cada paso tiene los campos obligatorios y una seccion conocida', () => {
    for (const paso of PASOS) {
      assert.ok(SECCIONES.includes(paso.seccion), paso.id);
      assert.ok(METODOS.includes(paso.metodo), paso.id);
      assert.ok(paso.titulo.length > 5, paso.id);
      assert.ok(paso.ruta.startsWith('/'), paso.id);
      assert.ok(Number.isInteger(paso.esperado) && paso.esperado >= 200 && paso.esperado < 600, paso.id);
    }
  });

  it('agrupa los pasos por seccion en el orden declarado', () => {
    const orden = PASOS.map((p) => SECCIONES.indexOf(p.seccion));
    assert.deepEqual(orden, [...orden].sort((a, b) => a - b));
    for (const seccion of SECCIONES) assert.ok(PASOS.some((p) => p.seccion === seccion), seccion);
  });

  it('usa solo variables que un paso anterior guardo', () => {
    const guardadas = new Set([ALEATORIO]);
    for (const paso of PASOS) {
      for (const variable of variablesDelPaso(paso)) {
        assert.ok(guardadas.has(variable), `${paso.id} usa ${variable} antes de guardarla`);
      }
      for (const variable of Object.keys(paso.guardar ?? {})) {
        assert.ok(!guardadas.has(variable), `${variable} se guarda dos veces`);
        guardadas.add(variable);
      }
    }
  });

  it('los cuerpos con JSON son JSON valido una vez resueltas las variables', () => {
    for (const paso of PASOS.filter((p) => p.cuerpo !== undefined && !p.tipo)) {
      const resuelto = paso.cuerpo.replace(/\{[A-Za-z0-9]+\}/g, '1');
      assert.doesNotThrow(() => JSON.parse(resuelto), paso.id);
    }
  });

  it('cada paso apunta a una ruta de la aplicacion', () => {
    for (const paso of PASOS) {
      const ruta = rutaLimpia(paso.ruta);
      const existe = registradas.some((r) => patronDe(r.ruta).test(ruta));
      assert.ok(existe, `${paso.metodo} ${paso.ruta}`);
      if (paso.esperado !== 405) {
        assert.ok(registradas.some((r) => r.metodo === paso.metodo && patronDe(r.ruta).test(ruta)), `${paso.metodo} ${paso.ruta}`);
      }
    }
  });

  it('cubre todas las rutas de la API con al menos un ejemplo exitoso', () => {
    const exitosos = PASOS.filter((p) => p.esperado < 300);
    const sinCubrir = registradas.filter((ruta) => {
      return !exitosos.some((p) => p.metodo === ruta.metodo && patronDe(ruta.ruta).test(rutaLimpia(p.ruta)));
    });
    assert.deepEqual(sinCubrir, []);
  });

  it('incluye al menos un ejemplo por cada codigo de error documentado', () => {
    const codigos = new Set(PASOS.map((p) => p.esperado));
    for (const codigo of [400, 404, 405, 409, 415]) assert.ok(codigos.has(codigo), String(codigo));
  });
});
