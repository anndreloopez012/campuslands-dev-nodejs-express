import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Almacen } from '../src/tx/almacen.js';
import { crearReloj } from '../soporte/datos.js';
import { rechazaCon } from '../soporte/entorno.js';

const nuevo = (extra = {}) => {
  const tiempo = crearReloj();
  const almacen = new Almacen({
    reloj: tiempo.reloj,
    iniciales: {
      cuentas: [{ id: 1, saldo: 100 }, { id: 2, saldo: 50 }],
    },
    ...extra,
  });
  return { almacen, ...tiempo };
};

describe('confirmacion y reversion', () => {
  it('aplica todas las escrituras al confirmar', async () => {
    const { almacen } = nuevo();
    await almacen.transaccion('mover', async (tx) => {
      tx.actualizar('cuentas', 1, { saldo: 70 });
      tx.actualizar('cuentas', 2, { saldo: 80 });
    });
    assert.deepEqual(almacen.consultar('cuentas').map((c) => c.saldo), [70, 80]);
  });

  it('dentro de la transaccion se ven las propias escrituras y fuera no', async () => {
    const { almacen } = nuevo();
    await almacen.transaccion('ver', async (tx) => {
      tx.actualizar('cuentas', 1, { saldo: 1 });
      assert.equal(tx.leer('cuentas', 1).saldo, 1);
      assert.equal(almacen.obtener('cuentas', 1).saldo, 100);
    });
    assert.equal(almacen.obtener('cuentas', 1).saldo, 1);
  });

  it('si el trabajo falla no cambia nada, ni siquiera lo ya escrito', async () => {
    const { almacen } = nuevo();
    const antes = almacen.instantanea();
    await assert.rejects(
      almacen.transaccion('falla', async (tx) => {
        tx.actualizar('cuentas', 1, { saldo: 0 });
        tx.insertar('cuentas', { saldo: 5 });
        throw new Error('se cayo');
      }),
      /se cayo/,
    );
    assert.deepEqual(almacen.instantanea(), antes);
  });

  it('insertar y eliminar en la misma transaccion no deja rastro', async () => {
    const { almacen } = nuevo();
    await almacen.transaccion('efimero', async (tx) => {
      const creada = tx.insertar('cuentas', { saldo: 9 });
      tx.eliminar('cuentas', creada.id);
    });
    assert.equal(almacen.consultar('cuentas').length, 2);
  });

  it('eliminar quita el registro al confirmar', async () => {
    const { almacen } = nuevo();
    await almacen.transaccion('borrar', async (tx) => tx.eliminar('cuentas', 2));
    assert.equal(almacen.obtener('cuentas', 2), null);
  });

  it('no reutiliza ids de insertar aunque la transaccion se revierta', async () => {
    const { almacen } = nuevo();
    await assert.rejects(almacen.transaccion('a', async (tx) => {
      tx.insertar('cuentas', { saldo: 1 });
      throw new Error('x');
    }));
    const creada = await almacen.transaccion('b', async (tx) => tx.insertar('cuentas', { saldo: 2 }));
    assert.equal(creada.id, 4);
  });

  it('acepta ids propios y rechaza duplicarlos', async () => {
    const { almacen } = nuevo();
    await almacen.transaccion('clave', async (tx) => tx.insertar('claves', { v: 1 }, 'abc'));
    assert.equal(almacen.obtener('claves', 'abc').v, 1);
    await assert.rejects(almacen.transaccion('dup', async (tx) => tx.insertar('claves', { v: 2 }, 'abc')), TypeError);
  });

  it('actualizar o eliminar algo inexistente es un error de programacion', async () => {
    const { almacen } = nuevo();
    await assert.rejects(almacen.transaccion('x', async (tx) => tx.actualizar('cuentas', 99, {})), TypeError);
    await assert.rejects(almacen.transaccion('y', async (tx) => tx.eliminar('cuentas', 99)), TypeError);
  });

  it('lo que devuelve el almacen son copias', async () => {
    const { almacen } = nuevo();
    const copia = almacen.obtener('cuentas', 1);
    copia.saldo = 999;
    assert.equal(almacen.obtener('cuentas', 1).saldo, 100);
    await almacen.transaccion('copia', async (tx) => {
      const leida = tx.leer('cuentas', 1);
      leida.saldo = 5;
      assert.equal(tx.leer('cuentas', 1).saldo, 100);
    });
    assert.equal(almacen.obtener('cuentas', 1).saldo, 100);
  });
});

describe('conflictos', () => {
  const dosTransacciones = async (almacen, primera, segunda, opciones) => {
    let liberar;
    const puerta = new Promise((resolver) => { liberar = resolver; });
    const a = almacen.transaccion('a', async (tx) => {
      await primera(tx);
      await puerta;
    }, opciones);
    const b = almacen.transaccion('b', async (tx) => {
      await segunda(tx);
      liberar();
    }, opciones);
    return Promise.allSettled([a, b]);
  };

  it('dos escrituras sobre el mismo registro: gana la primera en confirmar', async () => {
    const { almacen } = nuevo();
    const [ra, rb] = await dosTransacciones(
      almacen,
      async (tx) => tx.actualizar('cuentas', 1, { saldo: tx.leer('cuentas', 1).saldo + 10 }),
      async (tx) => tx.actualizar('cuentas', 1, { saldo: tx.leer('cuentas', 1).saldo + 20 }),
      { reintentos: 0 },
    );
    assert.equal(rb.status, 'fulfilled');
    assert.equal(ra.status, 'rejected');
    assert.ok(rechazaCon('CONFLICTO_DE_VERSION', { coleccion: 'cuentas', id: 1 })(ra.reason));
    assert.equal(almacen.obtener('cuentas', 1).saldo, 120);
  });

  it('con reintentos la segunda se repite sobre el dato nuevo y no se pierde ninguna', async () => {
    const { almacen } = nuevo();
    const [ra, rb] = await dosTransacciones(
      almacen,
      async (tx) => tx.actualizar('cuentas', 1, { saldo: tx.leer('cuentas', 1).saldo + 10 }),
      async (tx) => tx.actualizar('cuentas', 1, { saldo: tx.leer('cuentas', 1).saldo + 20 }),
      { reintentos: 2 },
    );
    assert.equal(ra.status, 'fulfilled');
    assert.equal(rb.status, 'fulfilled');
    assert.equal(almacen.obtener('cuentas', 1).saldo, 130);
    assert.deepEqual(almacen.diario().map((e) => e.estado), ['confirmada', 'conflicto', 'confirmada']);
    assert.equal(almacen.diario()[2].intento, 2);
  });

  it('leer un registro que otro cambia tambien invalida la transaccion', async () => {
    const { almacen } = nuevo();
    const [ra, rb] = await dosTransacciones(
      almacen,
      async (tx) => {
        const origen = tx.leer('cuentas', 1);
        tx.actualizar('cuentas', 2, { saldo: origen.saldo });
      },
      async (tx) => tx.actualizar('cuentas', 1, { saldo: 0 }),
      { reintentos: 0 },
    );
    assert.equal(rb.status, 'fulfilled');
    assert.equal(ra.status, 'rejected');
    assert.equal(almacen.obtener('cuentas', 2).saldo, 50);
  });

  it('leer algo que no existia y que otro crea tambien es un conflicto', async () => {
    const { almacen } = nuevo();
    const [ra, rb] = await dosTransacciones(
      almacen,
      async (tx) => {
        assert.equal(tx.leer('claves', 'k'), null);
        tx.insertar('claves', { v: 'a' }, 'k');
      },
      async (tx) => tx.insertar('claves', { v: 'b' }, 'k'),
      { reintentos: 0 },
    );
    assert.equal(rb.status, 'fulfilled');
    assert.ok(rechazaCon('CONFLICTO_DE_VERSION')(ra.reason));
    assert.equal(almacen.obtener('claves', 'k').v, 'b');
  });

  it('borrar y volver a crear un registro no engana a quien lo leyo antes', async () => {
    const { almacen } = nuevo();
    const [ra, rb] = await dosTransacciones(
      almacen,
      async (tx) => tx.actualizar('cuentas', 1, { saldo: tx.leer('cuentas', 1).saldo + 1 }),
      async (tx) => {
        tx.eliminar('cuentas', 1);
        tx.insertar('cuentas', { saldo: 100 }, 1);
      },
      { reintentos: 0 },
    );
    assert.equal(rb.status, 'fulfilled');
    assert.equal(ra.status, 'rejected');
  });

  it('transacciones sobre registros distintos no se estorban', async () => {
    const { almacen } = nuevo();
    const resultados = await dosTransacciones(
      almacen,
      async (tx) => tx.actualizar('cuentas', 1, { saldo: 1 }),
      async (tx) => tx.actualizar('cuentas', 2, { saldo: 2 }),
      { reintentos: 0 },
    );
    assert.ok(resultados.every((r) => r.status === 'fulfilled'));
  });

  it('solo se reintenta por conflicto, no por otros errores', async () => {
    const { almacen } = nuevo();
    let intentos = 0;
    await assert.rejects(almacen.transaccion('x', async () => {
      intentos += 1;
      throw new RangeError('regla');
    }, { reintentos: 5 }), RangeError);
    assert.equal(intentos, 1);
  });

  it('agota los reintentos y entrega el conflicto', async () => {
    const { almacen } = nuevo();
    let intentos = 0;
    await assert.rejects(almacen.transaccion('siempre', async (tx) => {
      intentos += 1;
      tx.actualizar('cuentas', 1, { saldo: intentos });
      await almacen.transaccion('rival', async (otra) => otra.actualizar('cuentas', 1, { saldo: -intentos }), { reintentos: 0 });
    }, { reintentos: 2 }), rechazaCon('CONFLICTO_DE_VERSION'));
    assert.equal(intentos, 3);
  });
});

describe('puntos de control, salidas, tiempo y simulacion', () => {
  it('revertir a un punto de control descarta lo posterior', async () => {
    const { almacen } = nuevo();
    await almacen.transaccion('puntos', async (tx) => {
      tx.actualizar('cuentas', 1, { saldo: 1 });
      tx.puntoDeControl('a');
      tx.actualizar('cuentas', 1, { saldo: 2 });
      tx.actualizar('cuentas', 2, { saldo: 3 });
      tx.encolar('evento', { n: 1 });
      tx.revertirA('a');
      assert.equal(tx.leer('cuentas', 1).saldo, 1);
      assert.equal(tx.leer('cuentas', 2).saldo, 50);
    });
    assert.equal(almacen.obtener('cuentas', 1).saldo, 1);
    assert.equal(almacen.obtener('cuentas', 2).saldo, 50);
    assert.equal(almacen.notificaciones().length, 0);
  });

  it('un punto de control inexistente es un error de programacion', async () => {
    const { almacen } = nuevo();
    await assert.rejects(almacen.transaccion('x', async (tx) => tx.revertirA('nada')), TypeError);
  });

  it('las salidas solo se publican si se confirma', async () => {
    const { almacen } = nuevo();
    await assert.rejects(almacen.transaccion('mala', async (tx) => {
      tx.encolar('a', { v: 1 });
      throw new Error('x');
    }));
    assert.equal(almacen.notificaciones().length, 0);
    await almacen.transaccion('buena', async (tx) => {
      tx.encolar('b', { v: 2 });
    });
    const [salida] = almacen.notificaciones();
    assert.equal(salida.tipo, 'b');
    assert.deepEqual(salida.carga, { v: 2 });
    assert.equal(salida.id, 1);
  });

  it('una transaccion que tarda demasiado se cancela', async () => {
    const { almacen, avanzar } = nuevo();
    await assert.rejects(almacen.transaccion('lenta', async (tx) => {
      tx.actualizar('cuentas', 1, { saldo: 0 });
      avanzar(6000);
      tx.leer('cuentas', 2);
    }, { tiempoMaximoMs: 5000 }), rechazaCon('TRANSACCION_EXPIRADA', { maximoMs: 5000 }));
    assert.equal(almacen.obtener('cuentas', 1).saldo, 100);
  });

  it('tambien se cancela si el tiempo se agota justo antes de confirmar', async () => {
    const { almacen, avanzar } = nuevo();
    await assert.rejects(almacen.transaccion('lenta', async (tx) => {
      tx.actualizar('cuentas', 1, { saldo: 0 });
      avanzar(6000);
    }, { tiempoMaximoMs: 5000 }), rechazaCon('TRANSACCION_EXPIRADA'));
    assert.equal(almacen.obtener('cuentas', 1).saldo, 100);
  });

  it('simular devuelve los cambios y no toca el almacen', async () => {
    const { almacen } = nuevo();
    const antes = almacen.instantanea();
    const { resultado, cambios } = await almacen.transaccion('prueba', async (tx) => {
      tx.actualizar('cuentas', 1, { saldo: 10 });
      tx.insertar('cuentas', { saldo: 7 });
      tx.encolar('x', {});
      return 'listo';
    }, { simular: true });
    assert.equal(resultado, 'listo');
    assert.deepEqual(cambios.map((c) => [c.coleccion, c.id, c.tipo]), [['cuentas', 1, 'actualizar'], ['cuentas', 3, 'insertar']]);
    assert.equal(cambios[0].antes.saldo, 100);
    assert.equal(cambios[0].despues.saldo, 10);
    assert.equal(cambios[1].antes, null);
    assert.deepEqual(almacen.instantanea(), antes);
    assert.equal(almacen.notificaciones().length, 0);
    assert.equal(almacen.diario()[0].estado, 'simulada');
  });
});

describe('diario', () => {
  it('registra estado, error, escrituras y duracion', async () => {
    const { almacen, avanzar } = nuevo();
    await almacen.transaccion('ok', async (tx) => {
      tx.actualizar('cuentas', 1, { saldo: 1 });
      avanzar(25);
    });
    await assert.rejects(almacen.transaccion('mal', async () => {
      throw new RangeError('x');
    }));
    const [ok, mal] = almacen.diario();
    assert.equal(ok.estado, 'confirmada');
    assert.equal(ok.duracionMs, 25);
    assert.deepEqual(ok.escrituras, [{ coleccion: 'cuentas', id: 1, tipo: 'actualizar' }]);
    assert.equal(mal.estado, 'revertida');
    assert.equal(mal.error, 'RangeError');
  });

  it('filtra por estado y conserva solo las ultimas entradas', async () => {
    const { almacen } = nuevo();
    for (let i = 0; i < 3; i += 1) await almacen.transaccion('n', async () => {});
    await assert.rejects(almacen.transaccion('m', async () => { throw new Error('x'); }));
    assert.equal(almacen.diario({ estado: 'revertida' }).length, 1);
    assert.equal(almacen.diario({ nombre: 'n' }).length, 3);
  });
});
