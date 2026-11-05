import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sustituir, tipoDe, variablesDe, variablesDelPaso } from '../src/ejemplos/plantilla.js';

describe('plantilla de ejemplos', () => {
  it('sustituye cada variable con el resolvedor', () => {
    assert.equal(sustituir('/partidas/{id}/jugadores/{jugador}', (n) => n.toUpperCase()), '/partidas/ID/jugadores/JUGADOR');
  });

  it('no confunde las llaves de un JSON con variables', () => {
    const cuerpo = '{\n  "nick": "Ana_{aleatorio}"\n}';
    assert.deepEqual(variablesDe(cuerpo), ['aleatorio']);
    assert.equal(sustituir(cuerpo, () => '7'), '{\n  "nick": "Ana_7"\n}');
  });

  it('junta las variables de la ruta y del cuerpo', () => {
    const paso = { ruta: '/partidas/{partidaId}', cuerpo: '{ "jugadorId": {jugadorA} }' };
    assert.deepEqual(variablesDelPaso(paso), ['partidaId', 'jugadorA']);
    assert.deepEqual(variablesDelPaso({ ruta: '/' }), []);
  });

  it('deduce el tipo de contenido', () => {
    assert.equal(tipoDe({ ruta: '/' }), null);
    assert.equal(tipoDe({ cuerpo: '{}' }), 'application/json');
    assert.equal(tipoDe({ cuerpo: 'a=b', tipo: 'text/plain' }), 'text/plain');
  });
});
