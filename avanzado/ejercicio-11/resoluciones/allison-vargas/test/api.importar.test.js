import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';
import {
  asentar, cancion, crearCompuerta, isrcDe, lista, ndjson,
} from '../soporte/entorno.js';

describe('POST /importaciones', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  const total = async () => (await api.pedir('/resumen')).cuerpo.data.canciones;

  it('con esperar=true entrega el resultado final con contadores y lotes', async () => {
    const r = await api.importar(lista(25), '?esperar=true&tamanoLote=10');
    assert.equal(r.status, 201);
    const d = r.cuerpo.data;
    assert.equal(d.estado, 'completada');
    assert.deepEqual(d.contadores, {
      creadas: 25, actualizadas: 0, omitidas: 0, rechazadas: 0, descartadas: 0,
    });
    assert.deepEqual(d.lotes, { total: 3, completados: 3 });
    assert.equal(d.porcentaje, 100);
    assert.equal(d.artistasNuevos, 1);
    assert.equal(d.formato, 'json');
    assert.equal(d.finalizadaEn, '2026-11-05T12:00:00.000Z');
    assert.equal(await total(), 25);
  });

  it('sin esperar responde 202 con Location y se puede consultar el avance', async () => {
    const r = await api.importar(lista(5));
    assert.equal(r.status, 202);
    assert.equal(r.cabeceras.get('location'), '/avanzado/ejercicio-11/importaciones/1');
    assert.equal(r.cuerpo.data.estado, 'en_cola');
    await asentar();
    const final = await api.pedir('/importaciones/1');
    assert.equal(final.cuerpo.data.estado, 'completada');
    assert.equal(final.cuerpo.data.procesadas, 5);
  });

  it('acepta ndjson y reporta las lineas que no son json con su numero de linea', async () => {
    const cuerpo = ndjson(cancion(1), 'esto no es json', '', cancion(2));
    const r = await api.enviar('/importaciones?esperar=true', cuerpo, { tipo: 'application/x-ndjson' });
    assert.equal(r.status, 201);
    assert.equal(r.cuerpo.data.formato, 'ndjson');
    assert.equal(r.cuerpo.data.contadores.creadas, 2);
    assert.equal(r.cuerpo.data.contadores.rechazadas, 1);
    const rechazos = (await api.pedir('/importaciones/1/rechazos')).cuerpo.data;
    assert.equal(rechazos[0].fila, 2);
    assert.equal(rechazos[0].datos, 'esto no es json');
  });

  it('modo permisivo guarda lo valido y guarda los rechazos con su fila y campos', async () => {
    const filas = [cancion(1), cancion(2, { anio: 3000 }), cancion(3, { isrc: 'mal' }), cancion(4)];
    const r = await api.importar(filas, '?esperar=true');
    assert.equal(r.cuerpo.data.contadores.creadas, 2);
    assert.equal(r.cuerpo.data.contadores.rechazadas, 2);
    const rechazos = (await api.pedir('/importaciones/1/rechazos')).cuerpo;
    assert.deepEqual(rechazos.data.map((x) => [x.fila, x.errores[0].campo]), [[2, 'anio'], [3, 'isrc']]);
    assert.equal(rechazos.data[0].datos.titulo, 'Tema 2');
    assert.equal(await total(), 2);
  });

  it('modo todo-o-nada no guarda nada si una sola fila es mala', async () => {
    const r = await api.importar([...lista(10), cancion(11, { genero: 'x' })], '?esperar=true&modo=todo-o-nada&tamanoLote=4');
    assert.equal(r.cuerpo.data.estado, 'fallida');
    assert.match(r.cuerpo.data.motivo, /ninguno|ningun/);
    assert.equal(r.cuerpo.data.contadores.creadas, 0);
    assert.equal(r.cuerpo.data.contadores.descartadas, 10);
    assert.equal(r.cuerpo.data.contadores.rechazadas, 1);
    assert.equal(await total(), 0);
  });

  it('modo todo-o-nada aplica todo cuando todo es valido', async () => {
    const r = await api.importar(lista(10), '?esperar=true&modo=todo-o-nada&tamanoLote=3');
    assert.equal(r.cuerpo.data.estado, 'completada');
    assert.equal(await total(), 10);
  });

  it('en todo-o-nada los lotes se ven recien al final', async () => {
    const compuerta = crearCompuerta();
    const otra = await levantarApi({ cederTurno: compuerta.cederTurno });
    try {
      await otra.importar(lista(9), '?modo=todo-o-nada&tamanoLote=3');
      await compuerta.liberarUno();
      await compuerta.liberarUno();
      assert.equal((await otra.pedir('/importaciones/1')).cuerpo.data.lotes.completados, 2);
      assert.equal((await otra.pedir('/resumen')).cuerpo.data.canciones, 0);
      await compuerta.abrir();
      assert.equal((await otra.pedir('/resumen')).cuerpo.data.canciones, 9);
    } finally {
      await otra.cerrar();
    }
  });

  it('en permisivo cada lote se guarda al terminar', async () => {
    const compuerta = crearCompuerta();
    const otra = await levantarApi({ cederTurno: compuerta.cederTurno });
    try {
      await otra.importar(lista(9), '?tamanoLote=3');
      assert.equal((await otra.pedir('/importaciones/1')).cuerpo.data.estado, 'en_cola');
      await compuerta.liberarUno();
      let estado = (await otra.pedir('/importaciones/1')).cuerpo.data;
      assert.equal(estado.estado, 'procesando');
      assert.equal(estado.procesadas, 3);
      assert.equal(estado.porcentaje, 33);
      assert.equal((await otra.pedir('/resumen')).cuerpo.data.canciones, 3);
      await compuerta.liberarUno();
      estado = (await otra.pedir('/importaciones/1')).cuerpo.data;
      assert.equal(estado.procesadas, 6);
      assert.equal(estado.porcentaje, 67);
      await compuerta.abrir();
      assert.equal((await otra.pedir('/importaciones/1')).cuerpo.data.estado, 'completada');
    } finally {
      await otra.cerrar();
    }
  });

  describe('conflictos con canciones que ya existen', () => {
    beforeEach(async () => { await api.importar(lista(3), '?esperar=true'); });

    it('omitir deja lo que habia', async () => {
      const r = await api.importar([cancion(1, { titulo: 'Nuevo titulo' }), cancion(4)], '?esperar=true');
      assert.deepEqual([r.cuerpo.data.contadores.creadas, r.cuerpo.data.contadores.omitidas], [1, 1]);
      assert.equal((await api.pedir(`/canciones/${isrcDe(1)}`)).cuerpo.data.titulo, 'Tema 1');
    });

    it('actualizar cambia lo distinto y sube la version; lo igual se omite', async () => {
      const r = await api.importar([cancion(1, { titulo: 'Nuevo titulo' }), cancion(2)], '?esperar=true&conflicto=actualizar');
      assert.deepEqual([r.cuerpo.data.contadores.actualizadas, r.cuerpo.data.contadores.omitidas], [1, 1]);
      const guardada = (await api.pedir(`/canciones/${isrcDe(1)}`)).cuerpo.data;
      assert.equal(guardada.titulo, 'Nuevo titulo');
      assert.equal(guardada.version, 2);
      assert.equal(guardada.importacionId, 2);
      assert.equal((await api.pedir(`/canciones/${isrcDe(2)}`)).cuerpo.data.version, 1);
    });

    it('fallar rechaza las filas repetidas', async () => {
      const r = await api.importar([cancion(1), cancion(4)], '?esperar=true&conflicto=fallar');
      assert.deepEqual([r.cuerpo.data.contadores.creadas, r.cuerpo.data.contadores.rechazadas], [1, 1]);
      const rechazo = (await api.pedir('/importaciones/2/rechazos')).cuerpo.data[0];
      assert.equal(rechazo.errores[0].campo, 'isrc');
    });
  });

  it('un isrc repetido dentro del mismo archivo cuenta como conflicto con la fila anterior', async () => {
    const filas = [cancion(1), cancion(1, { titulo: 'Segunda version' }), cancion(2)];
    const omitir = await api.importar(filas, '?esperar=true');
    assert.deepEqual([omitir.cuerpo.data.contadores.creadas, omitir.cuerpo.data.contadores.omitidas], [2, 1]);
    const actualizar = await api.importar([cancion(5), cancion(5, { titulo: 'Otra' })], '?esperar=true&conflicto=actualizar&tamanoLote=1');
    assert.deepEqual([actualizar.cuerpo.data.contadores.creadas, actualizar.cuerpo.data.contadores.actualizadas], [1, 1]);
    assert.equal((await api.pedir(`/canciones/${isrcDe(5)}`)).cuerpo.data.titulo, 'Otra');
  });

  it('todo-o-nada con conflicto=fallar detecta repetidos dentro del archivo', async () => {
    const r = await api.importar([cancion(1), cancion(1)], '?esperar=true&modo=todo-o-nada&conflicto=fallar');
    assert.equal(r.cuerpo.data.estado, 'fallida');
    assert.equal(await total(), 0);
  });

  it('unifica el nombre del artista con el que ya existia', async () => {
    await api.importar([cancion(1, { artista: 'Mar\u00EDa del Mar' })], '?esperar=true');
    const r = await api.importar([cancion(2, { artista: 'maria DEL mar' }), cancion(3, { artista: 'Otro Artista' })], '?esperar=true');
    assert.equal(r.cuerpo.data.artistasNuevos, 1);
    assert.equal((await api.pedir(`/canciones/${isrcDe(2)}`)).cuerpo.data.artista, 'Mar\u00EDa del Mar');
    const artistas = (await api.pedir('/artistas')).cuerpo.data;
    assert.deepEqual(artistas.map((a) => [a.nombre, a.canciones]), [['Mar\u00EDa del Mar', 2], ['Otro Artista', 1]]);
  });

  it('dryRun calcula lo que pasaria sin guardar nada', async () => {
    const r = await api.importar([...lista(3), cancion(4, { anio: 1 })], '?esperar=true&dryRun=true');
    assert.equal(r.status, 200);
    assert.equal(r.cuerpo.data.dryRun, true);
    assert.equal(r.cuerpo.data.estado, 'completada');
    assert.equal(r.cuerpo.data.contadores.creadas, 3);
    assert.equal(r.cuerpo.data.contadores.rechazadas, 1);
    assert.equal(await total(), 0);
    assert.equal((await api.accion('/importaciones/1/revertir')).status, 409);
  });

  it('el segundo archivo se procesa despues del primero, en orden', async () => {
    const compuerta = crearCompuerta();
    const otra = await levantarApi({ cederTurno: compuerta.cederTurno });
    try {
      await otra.importar(lista(2), '');
      await otra.importar(lista(2, 10), '');
      await compuerta.liberarUno();
      const estados = async () => (await otra.pedir('/importaciones')).cuerpo.data.map((i) => i.estado);
      assert.deepEqual(await estados(), ['en_cola', 'completada']);
      await compuerta.abrir();
      assert.deepEqual(await estados(), ['completada', 'completada']);
    } finally {
      await otra.cerrar();
    }
  });

  describe('idempotencia', () => {
    it('repetir la misma clave y contenido devuelve la misma importacion sin duplicar', async () => {
      const primera = await api.importar(lista(3), '?esperar=true', { 'Idempotency-Key': 'carga-1' });
      const repetida = await api.importar(lista(3), '?esperar=true', { 'Idempotency-Key': 'carga-1' });
      assert.equal(primera.status, 201);
      assert.equal(repetida.status, 200);
      assert.equal(repetida.cabeceras.get('idempotent-replayed'), 'true');
      assert.equal(repetida.cuerpo.repetida, true);
      assert.equal(repetida.cuerpo.data.id, primera.cuerpo.data.id);
      assert.equal((await api.pedir('/importaciones')).cuerpo.paginacion.total, 1);
    });

    it('la misma clave con otro contenido u otras opciones da 409', async () => {
      await api.importar(lista(3), '?esperar=true', { 'Idempotency-Key': 'carga-2' });
      const otroContenido = await api.importar(lista(4), '', { 'Idempotency-Key': 'carga-2' });
      assert.equal(otroContenido.status, 409);
      assert.equal(otroContenido.cuerpo.codigo, 'CLAVE_DE_IDEMPOTENCIA_REUTILIZADA');
      const otraOpcion = await api.importar(lista(3), '?conflicto=actualizar', { 'Idempotency-Key': 'carga-2' });
      assert.equal(otraOpcion.status, 409);
    });

    it('sin clave, el mismo archivo si se procesa dos veces', async () => {
      await api.importar(lista(3), '?esperar=true');
      const segunda = await api.importar(lista(3), '?esperar=true');
      assert.equal(segunda.cuerpo.data.contadores.omitidas, 3);
    });
  });

  describe('cola', () => {
    it('rechaza con 429 y Retry-After cuando ya hay 10 esperando', async () => {
      const compuerta = crearCompuerta();
      const otra = await levantarApi({ cederTurno: compuerta.cederTurno });
      try {
        for (let i = 0; i < 11; i += 1) assert.equal((await otra.importar(lista(1, i + 1))).status, 202);
        const r = await otra.importar(lista(1, 99));
        assert.equal(r.status, 429);
        assert.equal(r.cuerpo.codigo, 'COLA_LLENA');
        assert.equal(r.cabeceras.get('retry-after'), '5');
        await compuerta.abrir();
        assert.equal((await otra.importar(lista(1, 99))).status, 202);
      } finally {
        await otra.cerrar();
      }
    });
  });

  describe('cancelar', () => {
    it('cancela una importacion que todavia esta en cola', async () => {
      const compuerta = crearCompuerta();
      const otra = await levantarApi({ cederTurno: compuerta.cederTurno });
      try {
        await otra.importar(lista(2));
        await otra.importar(lista(2, 10));
        const r = await otra.accion('/importaciones/2/cancelar');
        assert.equal(r.status, 200);
        assert.equal(r.cuerpo.data.estado, 'cancelada');
        await compuerta.abrir();
        assert.equal((await otra.pedir('/resumen')).cuerpo.data.canciones, 2);
      } finally {
        await otra.cerrar();
      }
    });

    it('en permisivo conserva los lotes ya terminados', async () => {
      const compuerta = crearCompuerta();
      const otra = await levantarApi({ cederTurno: compuerta.cederTurno });
      try {
        await otra.importar(lista(9), '?tamanoLote=3');
        await compuerta.liberarUno();
        const pedida = await otra.accion('/importaciones/1/cancelar');
        assert.equal(pedida.status, 202);
        assert.equal(pedida.cuerpo.data.cancelacionSolicitada, true);
        await compuerta.abrir();
        const final = (await otra.pedir('/importaciones/1')).cuerpo.data;
        assert.equal(final.estado, 'cancelada');
        assert.equal(final.procesadas, 3);
        assert.equal((await otra.pedir('/resumen')).cuerpo.data.canciones, 3);
      } finally {
        await otra.cerrar();
      }
    });

    it('en todo-o-nada no deja ningun cambio', async () => {
      const compuerta = crearCompuerta();
      const otra = await levantarApi({ cederTurno: compuerta.cederTurno });
      try {
        await otra.importar(lista(9), '?tamanoLote=3&modo=todo-o-nada');
        await compuerta.liberarUno();
        await otra.accion('/importaciones/1/cancelar');
        await compuerta.abrir();
        const final = (await otra.pedir('/importaciones/1')).cuerpo.data;
        assert.equal(final.estado, 'cancelada');
        assert.equal(final.contadores.descartadas, 3);
        assert.equal((await otra.pedir('/resumen')).cuerpo.data.canciones, 0);
      } finally {
        await otra.cerrar();
      }
    });

    it('no se puede cancelar una importacion terminada ni una inexistente', async () => {
      await api.importar(lista(1), '?esperar=true');
      const r = await api.accion('/importaciones/1/cancelar');
      assert.equal(r.status, 409);
      assert.equal(r.cuerpo.codigo, 'IMPORTACION_FINALIZADA');
      assert.equal((await api.accion('/importaciones/9/cancelar')).status, 404);
    });
  });

  describe('revertir', () => {
    it('quita lo creado y deja las canciones como estaban antes', async () => {
      await api.importar(lista(2), '?esperar=true');
      await api.importar([cancion(1, { titulo: 'Modificado' }), cancion(3)], '?esperar=true&conflicto=actualizar');
      const r = await api.accion('/importaciones/2/revertir');
      assert.equal(r.status, 200);
      assert.equal(r.cuerpo.data.revertidas, 2);
      assert.equal(r.cuerpo.data.importacion.revertida, true);
      assert.equal((await api.pedir(`/canciones/${isrcDe(1)}`)).cuerpo.data.titulo, 'Tema 1');
      assert.equal((await api.pedir(`/canciones/${isrcDe(3)}`)).status, 404);
      assert.equal(await total(), 2);
    });

    it('omite lo que otra importacion cambio despues', async () => {
      await api.importar(lista(2), '?esperar=true');
      await api.importar([cancion(1, { titulo: 'B' })], '?esperar=true&conflicto=actualizar');
      await api.importar([cancion(1, { titulo: 'C' })], '?esperar=true&conflicto=actualizar');
      const r = await api.accion('/importaciones/2/revertir');
      assert.equal(r.cuerpo.data.revertidas, 0);
      assert.equal(r.cuerpo.data.omitidasPorCambios, 1);
      assert.equal((await api.pedir(`/canciones/${isrcDe(1)}`)).cuerpo.data.titulo, 'C');
    });

    it('revertir libera al artista que se quedo sin canciones', async () => {
      await api.importar(lista(2), '?esperar=true');
      await api.accion('/importaciones/1/revertir');
      assert.deepEqual((await api.pedir('/artistas')).cuerpo.data, []);
    });

    it('no se puede revertir dos veces, ni algo fallido, ni algo que no termino', async () => {
      await api.importar(lista(2), '?esperar=true');
      await api.accion('/importaciones/1/revertir');
      const dos = await api.accion('/importaciones/1/revertir');
      assert.equal(dos.status, 409);
      assert.equal(dos.cuerpo.codigo, 'IMPORTACION_NO_REVERTIBLE');
      await api.importar([cancion(1, { anio: 1 })], '?esperar=true&modo=todo-o-nada');
      assert.equal((await api.accion('/importaciones/2/revertir')).status, 409);
      assert.equal((await api.accion('/importaciones/9/revertir')).status, 404);
    });

    it('no se puede revertir una importacion que sigue en cola', async () => {
      const compuerta = crearCompuerta();
      const otra = await levantarApi({ cederTurno: compuerta.cederTurno });
      try {
        await otra.importar(lista(2));
        const r = await otra.accion('/importaciones/1/revertir');
        assert.equal(r.status, 409);
        assert.match(r.cuerpo.message, /todavia no termino/);
        await compuerta.abrir();
      } finally {
        await otra.cerrar();
      }
    });
  });

  describe('rechazos', () => {
    beforeEach(async () => {
      const filas = [cancion(1, { anio: 5 }), cancion(2), cancion(3, { titulo: '=SUMA(1)', genero: 'x', isrc: 'mal' })];
      await api.importar(filas, '?esperar=true');
    });

    it('se exportan en ndjson', async () => {
      const r = await api.pedir('/importaciones/1/rechazos/exportar');
      assert.equal(r.cabeceras.get('content-type'), 'application/x-ndjson; charset=utf-8');
      assert.equal(r.cabeceras.get('content-disposition'), 'attachment; filename="rechazos.ndjson"');
      const lineas = r.cuerpo.trim().split('\n').map((l) => JSON.parse(l));
      assert.deepEqual(lineas.map((l) => l.fila), [1, 3]);
    });

    it('se exportan en csv y neutralizan formulas', async () => {
      const r = await api.pedir('/importaciones/1/rechazos/exportar?formato=csv');
      assert.equal(r.cabeceras.get('content-type'), 'text/csv; charset=utf-8');
      const lineas = r.cuerpo.trim().split('\r\n');
      assert.equal(lineas[0], 'fila,isrc,titulo,artista,motivo');
      assert.equal(lineas.length, 3);
      assert.match(lineas[1], /^1,QZABC2400001,Tema 1,Luna Roja,/);
      assert.ok(lineas[2].includes("'=SUMA(1)"));
    });

    it('se paginan y validan', async () => {
      const r = await api.pedir('/importaciones/1/rechazos?limite=1&pagina=2');
      assert.equal(r.cuerpo.data.length, 1);
      assert.equal(r.cuerpo.paginacion.total, 2);
      assert.equal((await api.pedir('/importaciones/1/rechazos/exportar?formato=xml')).status, 400);
      assert.equal((await api.pedir('/importaciones/9/rechazos')).status, 404);
    });
  });

  it('guarda como maximo 1000 rechazos y cuenta el resto', async () => {
    const malas = Array.from({ length: 1200 }, (_, i) => cancion(i + 1, { anio: 5 }));
    const r = await api.importar(malas, '?esperar=true&tamanoLote=500');
    assert.equal(r.cuerpo.data.contadores.rechazadas, 1200);
    assert.equal(r.cuerpo.data.rechazosGuardados, 1000);
    assert.equal(r.cuerpo.data.rechazosOmitidos, 200);
  });

  it('un error inesperado deja la importacion como fallida y se registra', async () => {
    const errores = [];
    const rota = await levantarApi({ registro: (e) => errores.push(e), cederTurno: async () => { throw new Error('se cayo'); } });
    try {
      const r = await rota.importar(lista(2), '?esperar=true');
      assert.equal(r.cuerpo.data.estado, 'fallida');
      assert.match(r.cuerpo.data.motivo, /error interno/);
      assert.ok(errores.some((e) => e.mensaje === 'se cayo'));
    } finally {
      await rota.cerrar();
    }
  });

  describe('entrada invalida', () => {
    it('rechaza una lista vacia, un cuerpo sin lista y mas de 5000 canciones', async () => {
      assert.equal((await api.importar([])).cuerpo.codigo, 'IMPORTACION_VACIA');
      const sinLista = await api.enviar('/importaciones', JSON.stringify({ canciones: 'x' }));
      assert.equal(sinLista.status, 400);
      assert.equal(sinLista.cuerpo.errores[0].campo, 'canciones');
      assert.equal((await api.enviar('/importaciones', '[]')).status, 400);
      const grande = await api.importar(lista(5001));
      assert.equal(grande.status, 413);
      assert.equal(grande.cuerpo.codigo, 'IMPORTACION_DEMASIADO_GRANDE');
    });

    it('rechaza json malo, tipos no soportados, utf-8 invalido y cuerpos enormes', async () => {
      assert.equal((await api.enviar('/importaciones', '{')).cuerpo.codigo, 'JSON_INVALIDO');
      assert.equal((await api.enviar('/importaciones', 'a,b', { tipo: 'text/csv' })).status, 415);
      assert.equal((await api.enviar('/importaciones', '{}', { tipo: null })).status, 415);
      const malUtf8 = await api.enviar('/importaciones', Buffer.from([0x7b, 0xff, 0xfe]), { tipo: 'application/x-ndjson' });
      assert.equal(malUtf8.cuerpo.codigo, 'CODIFICACION_INVALIDA');
      const enorme = await api.enviar('/importaciones', Buffer.alloc(2 * 1024 * 1024 + 10, 97), { tipo: 'application/x-ndjson' });
      assert.equal(enorme.status, 413);
      assert.equal(enorme.cuerpo.codigo, 'PAYLOAD_GRANDE');
    });

    it('valida las opciones de la consulta', async () => {
      const r = await api.importar(lista(1), '?modo=raro&tamanoLote=0&conflicto=x&otra=1');
      assert.equal(r.status, 400);
      assert.deepEqual(r.cuerpo.errores.map((e) => e.campo).sort(), ['conflicto', 'modo', 'otra', 'tamanoLote']);
      const clave = await api.importar(lista(1), '', { 'Idempotency-Key': 'con espacio' });
      assert.equal(clave.status, 400);
    });
  });
});
