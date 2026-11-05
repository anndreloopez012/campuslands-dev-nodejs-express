import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let servidor;
let base;

before(async () => {
  await new Promise((resolver) => {
    servidor = app.listen(0, resolver);
  });
  base = `http://127.0.0.1:${servidor.address().port}/intermedio/ejercicio-24`;
});

after(() => new Promise((resolver) => servidor.close(resolver)));

async function pedir(ruta, opciones) {
  const respuesta = await fetch(`${base}${ruta}`, opciones);
  const texto = await respuesta.text();
  return { respuesta, cuerpo: texto ? JSON.parse(texto) : null };
}

const enviarJson = (ruta, cuerpo, metodo = 'POST') =>
  pedir(ruta, { method: metodo, headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });

describe('API de formulas quimicas', () => {
  it('responde la ruta principal', async () => {
    const { respuesta, cuerpo } = await pedir('');
    assert.equal(respuesta.status, 200);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'testing de servicios' });
  });

  it('analiza una formula', async () => {
    const { respuesta, cuerpo } = await enviarJson('/formulas/analizar', { formula: 'Ca(OH)2' });
    assert.equal(respuesta.status, 200);
    assert.equal(cuerpo.data.masaMolar, 74.092);
    assert.equal(cuerpo.data.composicion.length, 3);
  });

  it('responde 400 con la posicion del error en una formula invalida', async () => {
    const { respuesta, cuerpo } = await enviarJson('/formulas/analizar', { formula: 'Ca(OH2' });
    assert.equal(respuesta.status, 400);
    assert.equal(cuerpo.codigo, 'FORMULA_INVALIDA');
    assert.equal(cuerpo.errores[0].posicion, 2);
  });

  it('convierte gramos a moles', async () => {
    const { cuerpo } = await enviarJson('/formulas/conversion', { formula: 'H2O', gramos: 36.03 });
    assert.equal(cuerpo.data.moles, 2);
  });

  it('responde 400 si se envian gramos y moles juntos', async () => {
    const { respuesta } = await enviarJson('/formulas/conversion', { formula: 'H2O', gramos: 1, moles: 1 });
    assert.equal(respuesta.status, 400);
  });

  it('verifica una ecuacion', async () => {
    const balanceada = await enviarJson('/formulas/ecuaciones', { ecuacion: '2H2 + O2 -> 2H2O' });
    assert.equal(balanceada.cuerpo.data.balanceada, true);

    const desbalanceada = await enviarJson('/formulas/ecuaciones', { ecuacion: 'H2 + O2 -> H2O' });
    assert.equal(desbalanceada.cuerpo.data.balanceada, false);
    assert.equal(desbalanceada.cuerpo.data.diferencias[0].elemento, 'O');
  });

  it('lista, crea y rechaza duplicados de compuestos', async () => {
    const lista = await pedir('/compuestos?categoria=acido');
    assert.deepEqual(lista.cuerpo.data.map((item) => item.formula), ['H2SO4']);

    const creado = await enviarJson('/compuestos', { nombre: 'Metano', formula: 'CH4', categoria: 'organico' });
    assert.equal(creado.respuesta.status, 201);
    assert.equal(creado.cuerpo.data.masaMolar, 16.043);
    assert.match(creado.respuesta.headers.get('location'), /\/compuestos\/\d+$/);

    const repetido = await enviarJson('/compuestos', { nombre: 'Gas natural', formula: 'CH4', categoria: 'organico' });
    assert.equal(repetido.respuesta.status, 409);
    assert.equal(repetido.cuerpo.codigo, 'FORMULA_DUPLICADA');
  });

  it('responde 404 y 405 donde corresponde', async () => {
    assert.equal((await pedir('/compuestos/99')).respuesta.status, 404);
    assert.equal((await pedir('/formulas/analizar')).respuesta.status, 405);
  });
});
