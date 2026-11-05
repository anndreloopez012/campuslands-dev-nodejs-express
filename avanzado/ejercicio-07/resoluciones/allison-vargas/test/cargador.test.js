import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MIN, SEG, pausa } from '../soporte/datos.js';
import { crearAsideDePrueba } from '../soporte/entorno.js';

const opciones = { ttlMs: 10 * SEG, staleMs: 10 * SEG, etiquetas: ['t'], ttlAusenteMs: 5 * SEG };

function cargadorContado(valor = 'dato') {
  const estado = { llamadas: 0 };
  estado.cargar = async () => {
    estado.llamadas += 1;
    return typeof valor === 'function' ? valor(estado.llamadas) : valor;
  };
  return estado;
}

describe('cache-aside', () => {
  it('la primera lectura carga y la segunda sale del cache', async () => {
    const { aside } = crearAsideDePrueba();
    const origen = cargadorContado();
    const primera = await aside.obtener('k', origen.cargar, opciones);
    const segunda = await aside.obtener('k', origen.cargar, opciones);
    assert.deepEqual([primera.estado, segunda.estado], ['MISS', 'HIT']);
    assert.equal(segunda.valor, 'dato');
    assert.equal(segunda.restanteMs, 10 * SEG);
    assert.equal(origen.llamadas, 1);
  });

  it('cuando el valor vence vuelve a cargar', async () => {
    const { aside, avanzar } = crearAsideDePrueba();
    const origen = cargadorContado((n) => `v${n}`);
    await aside.obtener('k', origen.cargar, { ...opciones, staleMs: 0 });
    avanzar(10 * SEG);
    const otra = await aside.obtener('k', origen.cargar, { ...opciones, staleMs: 0 });
    assert.equal(otra.estado, 'MISS');
    assert.equal(otra.valor, 'v2');
  });

  it('varias lecturas simultaneas comparten una sola carga', async () => {
    const { aside } = crearAsideDePrueba();
    let liberar;
    const puerta = new Promise((resolver) => {
      liberar = resolver;
    });
    let llamadas = 0;
    const cargar = async () => {
      llamadas += 1;
      await puerta;
      return 'caro';
    };
    const lecturas = [1, 2, 3, 4].map(() => aside.obtener('k', cargar, opciones));
    await pausa();
    liberar();
    const resultados = await Promise.all(lecturas);
    assert.equal(llamadas, 1);
    assert.deepEqual(resultados.map((r) => r.estado).sort(), ['COALESCED', 'COALESCED', 'COALESCED', 'MISS']);
    assert.ok(resultados.every((r) => r.valor === 'caro'));
    assert.equal(aside.estadisticas().compartidas, 3);
    assert.equal(aside.estadisticas().enVuelo, 0);
  });

  it('un error de carga llega a todos los que esperaban y no se guarda', async () => {
    const { aside, cache } = crearAsideDePrueba();
    let liberar;
    const puerta = new Promise((resolver) => {
      liberar = resolver;
    });
    const falla = async () => {
      await puerta;
      throw new Error('fuente caida');
    };
    const lecturas = [aside.obtener('k', falla, opciones), aside.obtener('k', falla, opciones)];
    const resultados = Promise.allSettled(lecturas);
    await pausa();
    liberar();
    const [a, b] = await resultados;
    assert.equal(a.status, 'rejected');
    assert.equal(b.status, 'rejected');
    assert.equal(cache.espiar('k'), null);
    const recuperada = await aside.obtener('k', cargadorContado().cargar, opciones);
    assert.equal(recuperada.estado, 'MISS');
    assert.equal(aside.estadisticas().erroresDeCarga, 1);
  });
});

describe('cache-aside: datos obsoletos', () => {
  it('entrega el valor viejo al instante y lo renueva en segundo plano', async () => {
    const { aside, avanzar } = crearAsideDePrueba();
    const origen = cargadorContado((n) => `v${n}`);
    await aside.obtener('k', origen.cargar, opciones);
    avanzar(12 * SEG);
    const vieja = await aside.obtener('k', origen.cargar, opciones);
    assert.deepEqual([vieja.estado, vieja.valor], ['STALE', 'v1']);
    await aside.esperarRefrescos();
    const nueva = await aside.obtener('k', origen.cargar, opciones);
    assert.deepEqual([nueva.estado, nueva.valor], ['HIT', 'v2']);
    assert.equal(aside.estadisticas().refrescos, 1);
  });

  it('muchas lecturas obsoletas provocan un solo refresco', async () => {
    const { aside, avanzar } = crearAsideDePrueba();
    const origen = cargadorContado();
    await aside.obtener('k', origen.cargar, opciones);
    avanzar(12 * SEG);
    await Promise.all([1, 2, 3].map(() => aside.obtener('k', origen.cargar, opciones)));
    await aside.esperarRefrescos();
    assert.equal(origen.llamadas, 2);
  });

  it('si el refresco falla se sigue sirviendo el valor viejo y se cuenta el error', async () => {
    const { aside, avanzar } = crearAsideDePrueba();
    await aside.obtener('k', cargadorContado('bueno').cargar, opciones);
    avanzar(12 * SEG);
    const falla = async () => {
      throw new Error('caido');
    };
    const vieja = await aside.obtener('k', falla, opciones);
    assert.equal(vieja.valor, 'bueno');
    await aside.esperarRefrescos();
    assert.equal(aside.estadisticas().erroresDeRefresco, 1);
    const otra = await aside.obtener('k', falla, opciones);
    assert.deepEqual([otra.estado, otra.valor], ['STALE', 'bueno']);
    avanzar(10 * SEG);
    await assert.rejects(aside.obtener('k', falla, opciones), /caido/);
  });
});

describe('cache-aside: ausencias y modos', () => {
  it('recuerda por poco tiempo que algo no existe', async () => {
    const { aside, avanzar } = crearAsideDePrueba();
    const origen = cargadorContado(null);
    const primera = await aside.obtener('k', origen.cargar, opciones);
    const segunda = await aside.obtener('k', origen.cargar, opciones);
    assert.deepEqual([primera.ausente, primera.estado, segunda.ausente, segunda.estado], [true, 'MISS', true, 'HIT']);
    assert.equal(origen.llamadas, 1);
    avanzar(5 * SEG);
    await aside.obtener('k', origen.cargar, opciones);
    assert.equal(origen.llamadas, 2);
  });

  it('sin ttlAusenteMs la ausencia no se guarda', async () => {
    const { aside, cache } = crearAsideDePrueba();
    await aside.obtener('k', cargadorContado(null).cargar, { ...opciones, ttlAusenteMs: 0 });
    assert.equal(cache.espiar('k'), null);
  });

  it('refrescar ignora lo guardado y reemplaza el valor', async () => {
    const { aside } = crearAsideDePrueba();
    const origen = cargadorContado((n) => `v${n}`);
    await aside.obtener('k', origen.cargar, opciones);
    const nueva = await aside.obtener('k', origen.cargar, opciones, 'refrescar');
    assert.deepEqual([nueva.estado, nueva.valor], ['REFRESH', 'v2']);
    assert.equal((await aside.obtener('k', origen.cargar, opciones)).valor, 'v2');
  });

  it('omitir no lee ni escribe en el cache', async () => {
    const { aside, cache } = crearAsideDePrueba();
    const origen = cargadorContado();
    const resultado = await aside.obtener('k', origen.cargar, opciones, 'omitir');
    assert.deepEqual([resultado.estado, resultado.restanteMs], ['BYPASS', null]);
    assert.equal(cache.espiar('k'), null);
    assert.equal(cache.estadisticas().consultas, 0);
  });
});

describe('cache-aside: invalidacion durante una carga', () => {
  it('no guarda un valor leido antes de una invalidacion', async () => {
    const { aside, cache } = crearAsideDePrueba();
    let liberar;
    const puerta = new Promise((resolver) => {
      liberar = resolver;
    });
    const lectura = aside.obtener('k', async () => {
      await puerta;
      return 'viejo';
    }, opciones);
    await pausa();
    cache.invalidarEtiqueta('t');
    liberar();
    const resultado = await lectura;
    assert.equal(resultado.valor, 'viejo');
    assert.equal(cache.espiar('k'), null);
    assert.equal(aside.estadisticas().descartadas, 1);
  });

  it('tampoco guarda tras vaciar o borrar la clave', async () => {
    const { aside, cache } = crearAsideDePrueba();
    for (const accion of [() => cache.vaciar(), () => cache.borrar('k')]) {
      let liberar;
      const puerta = new Promise((resolver) => {
        liberar = resolver;
      });
      const lectura = aside.obtener('k', async () => {
        await puerta;
        return 'x';
      }, opciones);
      await pausa();
      accion();
      liberar();
      await lectura;
      assert.equal(cache.espiar('k'), null);
    }
    assert.equal(aside.estadisticas().descartadas, 2);
  });

  it('una invalidacion de otra etiqueta no afecta a la carga', async () => {
    const { aside, cache } = crearAsideDePrueba();
    let liberar;
    const puerta = new Promise((resolver) => {
      liberar = resolver;
    });
    const lectura = aside.obtener('k', async () => {
      await puerta;
      return 'ok';
    }, opciones);
    await pausa();
    cache.invalidarEtiqueta('ajena');
    liberar();
    await lectura;
    assert.equal(cache.espiar('k').valor.valor, 'ok');
    assert.ok(cache.espiar('k').restanteMs <= MIN);
  });
});
