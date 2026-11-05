import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { almacenEnMemoria } from '../src/middlewares/limitador.js';
import { crearReloj } from '../soporte/api.js';

describe('almacen del limitador', () => {
  it('cuenta golpes dentro de la ventana', () => {
    const almacen = almacenEnMemoria({ reloj: crearReloj() });
    assert.equal(almacen.golpear('ip', 1000).conteo, 1);
    assert.equal(almacen.golpear('ip', 1000).conteo, 2);
    assert.equal(almacen.golpear('otra', 1000).conteo, 1);
  });

  it('reinicia el conteo al terminar la ventana', () => {
    const reloj = crearReloj();
    const almacen = almacenEnMemoria({ reloj });
    almacen.golpear('ip', 1000);
    const { reinicia } = almacen.golpear('ip', 1000);
    assert.equal(reinicia, reloj().getTime() + 1000);
    reloj.avanzar(999);
    assert.equal(almacen.golpear('ip', 1000).conteo, 3);
    reloj.avanzar(1);
    assert.equal(almacen.golpear('ip', 1000).conteo, 1);
  });

  it('descarta ventanas vencidas para no crecer sin limite', () => {
    const reloj = crearReloj();
    const almacen = almacenEnMemoria({ reloj, maxClaves: 3 });
    for (const ip of ['a', 'b', 'c']) almacen.golpear(ip, 1000);
    reloj.avanzar(1000);
    almacen.golpear('d', 1000);
    assert.equal(almacen.tamano(), 1);
  });
});
