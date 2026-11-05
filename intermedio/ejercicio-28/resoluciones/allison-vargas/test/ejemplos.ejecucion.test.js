import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { PASOS } from '../src/ejemplos/catalogo.js';
import { ejecutar } from '../src/ejemplos/ejecutor.js';
import { levantar } from '../soporte/cliente.js';

describe('ejecucion de los ejemplos contra la API', () => {
  let cliente;

  const enviar = ({ metodo, ruta, tipo, cuerpo }) => cliente.pedir(ruta, {
    method: metodo,
    headers: tipo ? { 'content-type': tipo } : {},
    body: cuerpo,
  });

  beforeEach(async () => {
    cliente = await levantar(crearApp());
  });

  afterEach(() => cliente.cerrar());

  it('todos los ejemplos responden con el status esperado', async () => {
    const { resultados, correcto } = await ejecutar(PASOS, enviar);
    const fallos = resultados.filter((r) => !r.correcto).map((r) => `${r.id}: ${r.status} en vez de ${r.esperado}`);
    assert.deepEqual(fallos, []);
    assert.equal(correcto, true);
    assert.equal(resultados.length, PASOS.length);
  });

  it('guarda los ids creados para los pasos siguientes', async () => {
    const { variables } = await ejecutar(PASOS, enviar, { aleatorio: () => '4242' });
    assert.deepEqual(Object.keys(variables).sort(), ['jugadorA', 'jugadorB', 'jugadorC', 'nickA', 'partidaId']);
    assert.equal(variables.nickA, 'Ana_4242');
    assert.equal(variables.partidaId, 3);
  });

  it('la partida de los ejemplos termina con el jugador A como ganador', async () => {
    const { variables } = await ejecutar(PASOS, enviar);
    const { cuerpo } = await cliente.pedir(`/partidas/${variables.partidaId}`);
    assert.equal(cuerpo.data.estado, 'finalizada');
    assert.equal(cuerpo.data.ganadorId, variables.jugadorA);
  });

  it('se puede repetir sobre el mismo servidor porque los nicks cambian', async () => {
    const primera = await ejecutar(PASOS, enviar, { aleatorio: () => '1111' });
    const segunda = await ejecutar(PASOS, enviar, { aleatorio: () => '2222' });
    assert.equal(primera.correcto, true);
    assert.equal(segunda.correcto, true);
    assert.notEqual(primera.variables.partidaId, segunda.variables.partidaId);
  });

  it('repetir con el mismo sufijo hace fallar los ejemplos que crean jugadores', async () => {
    await ejecutar(PASOS, enviar, { aleatorio: () => '9999' });
    const { resultados, correcto } = await ejecutar(PASOS, enviar, { aleatorio: () => '9999' });
    assert.equal(correcto, false);
    assert.equal(resultados.find((r) => r.id === 'crearJugadorA').status, 409);
  });

  it('marca como fallido un paso que usa una variable que nunca se guardo', async () => {
    const { resultados, correcto } = await ejecutar(PASOS.slice(5, 6), enviar);
    assert.equal(correcto, false);
    assert.equal(resultados[0].status, 0);
    assert.match(resultados[0].respuesta.error, /jugadorA/);
  });

  it('informa cuando un status no coincide', async () => {
    const paso = { ...PASOS[0], esperado: 201 };
    const { resultados, correcto } = await ejecutar([paso], enviar);
    assert.equal(correcto, false);
    assert.equal(resultados[0].status, 200);
  });
});
