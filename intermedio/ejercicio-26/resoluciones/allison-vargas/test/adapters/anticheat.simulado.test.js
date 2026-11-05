import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearAnticheatSimulado } from '../../src/adapters/anticheat.simulado.js';

describe('adaptador anticheat simulado', () => {
  it('sanciona los nicks de la lista sin distinguir mayusculas', async () => {
    const anticheat = crearAnticheatSimulado();
    const veredicto = await anticheat.verificar('WALLHACK99');
    assert.equal(veredicto.limpio, false);
    assert.ok(veredicto.motivo);
  });

  it('deja pasar al resto y acepta una lista propia', async () => {
    assert.equal((await crearAnticheatSimulado().verificar('Viper')).limpio, true);
    assert.equal((await crearAnticheatSimulado({ sancionados: ['viper'] }).verificar('Viper')).limpio, false);
  });

  it('siempre responde al ping', async () => {
    assert.equal(await crearAnticheatSimulado().ping(), true);
  });
});
