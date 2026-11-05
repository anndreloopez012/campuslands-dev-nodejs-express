import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarTaller, AHORA } from '../soporte/taller.js';

describe('ordenes de trabajo', () => {
  let taller;
  let lucia;
  let admin;
  let carlos;
  let marta;

  beforeEach(async () => {
    taller = await levantarTaller();
    lucia = await taller.como('lucia');
    admin = await taller.como('admin');
    carlos = await taller.como('carlos');
    marta = await taller.como('marta');
  });

  afterEach(() => taller.cerrar());

  const stock = async (id) => (await admin.get(`/repuestos/${id}`)).cuerpo.data.stock;

  describe('creacion y consulta', () => {
    it('recepcion abre una orden en estado recibida con su historial', async () => {
      const { status, cabeceras, cuerpo } = await lucia.post('/ordenes', { motoId: 2, descripcion: 'Cambio de llanta delantera' });
      assert.equal(status, 201);
      assert.equal(cabeceras.get('location'), '/intermedio/ejercicio-30/ordenes/4');
      assert.equal(cuerpo.data.estado, 'recibida');
      assert.equal(cuerpo.data.mecanicoId, null);
      assert.equal(cuerpo.data.total, 0);
      assert.deepEqual(cuerpo.data.historial, [{ estado: 'recibida', en: AHORA.toISOString(), por: 2 }]);
    });

    it('permite una orden nueva para una moto cuya orden anterior ya se entrego', async () => {
      assert.equal((await lucia.post('/ordenes', { motoId: 3, descripcion: 'Revision de los 10000 km' })).status, 201);
    });

    it('no permite dos ordenes abiertas para la misma moto', async () => {
      const { status, cuerpo } = await lucia.post('/ordenes', { motoId: 1, descripcion: 'Otra revision completa' });
      assert.equal(status, 409);
      assert.equal(cuerpo.codigo, 'MOTO_EN_TALLER');
    });

    it('valida el cuerpo y la moto', async () => {
      for (const cuerpo of [{}, { motoId: 2 }, { motoId: 2, descripcion: 'x' }, { motoId: 'a', descripcion: 'Revision general' }, { motoId: 2, descripcion: 'Revision general', extra: 1 }]) {
        assert.equal((await lucia.post('/ordenes', cuerpo)).status, 400, JSON.stringify(cuerpo));
      }
      const sinMoto = await lucia.post('/ordenes', { motoId: 99, descripcion: 'Revision general' });
      assert.equal(sinMoto.status, 422);
      assert.equal(sinMoto.cuerpo.codigo, 'REFERENCIA_INVALIDA');
    });

    it('lista las mas recientes primero y filtra', async () => {
      assert.deepEqual((await admin.get('/ordenes')).cuerpo.data.map((o) => o.id), [3, 2, 1]);
      assert.deepEqual((await admin.get('/ordenes?orden=id')).cuerpo.data.map((o) => o.id), [1, 2, 3]);
      assert.deepEqual((await admin.get('/ordenes?estado=en_reparacion')).cuerpo.data.map((o) => o.id), [2]);
      assert.deepEqual((await admin.get('/ordenes?motoId=4')).cuerpo.data.map((o) => o.id), [3]);
      assert.deepEqual((await admin.get('/ordenes?mecanicoId=3')).cuerpo.data.map((o) => o.id), [1]);
      assert.equal((await admin.get('/ordenes')).cabeceras.get('x-total-count'), '3');
    });

    it('rechaza filtros invalidos', async () => {
      for (const consulta of ['estado=perdida', 'motoId=x', 'mecanicoId=0', 'orden=total']) {
        assert.equal((await admin.get(`/ordenes?${consulta}`)).status, 400, consulta);
      }
    });

    it('cada mecanico solo ve sus ordenes', async () => {
      assert.deepEqual((await carlos.get('/ordenes')).cuerpo.data.map((o) => o.id), [1]);
      assert.deepEqual((await marta.get('/ordenes')).cuerpo.data.map((o) => o.id), [2]);
      assert.deepEqual((await marta.get('/ordenes?estado=recibida')).cuerpo.data, []);
      assert.equal((await marta.get('/ordenes/2')).status, 200);
      const ajena = await carlos.get('/ordenes/2');
      assert.equal(ajena.status, 403);
      assert.equal(ajena.cuerpo.codigo, 'ORDEN_AJENA');
    });

    it('detalle con totales, 404 y 400', async () => {
      const { cuerpo } = await admin.get('/ordenes/1');
      assert.deepEqual(
        [cuerpo.data.subtotalRepuestos, cuerpo.data.manoDeObra, cuerpo.data.total],
        [15.5, 22.5, 38],
      );
      assert.equal((await admin.get('/ordenes/99')).cuerpo.codigo, 'ORDEN_NO_ENCONTRADA');
      assert.equal((await admin.get('/ordenes/abc')).status, 400);
    });
  });

  describe('asignacion', () => {
    it('asigna un mecanico y permite reasignar mientras no empiece la reparacion', async () => {
      const primera = await lucia.put('/ordenes/3/asignacion', { mecanicoId: 3 });
      assert.equal(primera.status, 200);
      assert.deepEqual([primera.cuerpo.data.estado, primera.cuerpo.data.mecanicoId], ['asignada', 3]);
      const segunda = await lucia.put('/ordenes/3/asignacion', { mecanicoId: 4 });
      assert.equal(segunda.cuerpo.data.mecanicoId, 4);
      assert.deepEqual(segunda.cuerpo.data.historial.map((h) => h.estado), ['recibida', 'asignada', 'asignada']);
    });

    it('solo acepta mecanicos activos', async () => {
      for (const mecanicoId of [2, 5, 99]) {
        const { status, cuerpo } = await lucia.put('/ordenes/3/asignacion', { mecanicoId });
        assert.equal(status, 422, String(mecanicoId));
        assert.equal(cuerpo.codigo, 'REFERENCIA_INVALIDA');
      }
      assert.equal((await lucia.put('/ordenes/3/asignacion', { mecanicoId: 'x' })).status, 400);
    });

    it('no asigna ordenes que ya avanzaron y solo lo hace recepcion o admin', async () => {
      const { status, cuerpo } = await lucia.put('/ordenes/2/asignacion', { mecanicoId: 3 });
      assert.equal(status, 409);
      assert.equal(cuerpo.codigo, 'TRANSICION_INVALIDA');
      assert.equal((await carlos.put('/ordenes/3/asignacion', { mecanicoId: 3 })).status, 403);
      assert.equal((await lucia.put('/ordenes/99/asignacion', { mecanicoId: 3 })).status, 404);
    });
  });

  describe('maquina de estados', () => {
    it('recorre asignada, en reparacion, lista y entregada con el rol correcto', async () => {
      await lucia.put('/ordenes/3/asignacion', { mecanicoId: 3 });
      assert.equal((await carlos.put('/ordenes/3/estado', { estado: 'en_reparacion' })).cuerpo.data.estado, 'en_reparacion');
      assert.equal((await carlos.put('/ordenes/3/estado', { estado: 'lista' })).cuerpo.data.estado, 'lista');
      const entregada = await lucia.put('/ordenes/3/estado', { estado: 'entregada' });
      assert.equal(entregada.cuerpo.data.estado, 'entregada');
      assert.deepEqual(
        entregada.cuerpo.data.historial.map((h) => [h.estado, h.por]),
        [['recibida', 2], ['asignada', 2], ['en_reparacion', 3], ['lista', 3], ['entregada', 2]],
      );
    });

    it('un mecanico ajeno no puede mover la orden y uno asignado no puede entregarla', async () => {
      await lucia.put('/ordenes/3/asignacion', { mecanicoId: 3 });
      const ajeno = await marta.put('/ordenes/3/estado', { estado: 'en_reparacion' });
      assert.equal(ajeno.status, 403);
      assert.equal(ajeno.cuerpo.codigo, 'ORDEN_AJENA');
      await carlos.put('/ordenes/3/estado', { estado: 'en_reparacion' });
      await carlos.put('/ordenes/3/estado', { estado: 'lista' });
      assert.equal((await carlos.put('/ordenes/3/estado', { estado: 'entregada' })).status, 403);
      assert.equal((await carlos.put('/ordenes/3/estado', { estado: 'cancelada' })).status, 403);
      assert.equal((await admin.put('/ordenes/3/estado', { estado: 'entregada' })).status, 200);
    });

    it('rechaza saltos y retrocesos con 409 sin cambiar nada', async () => {
      const saltos = [
        [3, 'lucia', 'entregada'],
        [3, 'admin', 'lista'],
        [3, 'admin', 'en_reparacion'],
        [2, 'lucia', 'entregada'],
        [1, 'admin', 'cancelada'],
        [1, 'admin', 'en_reparacion'],
      ];
      for (const [id, quien, estado] of saltos) {
        const sesion = await taller.como(quien);
        const { status, cuerpo } = await sesion.put(`/ordenes/${id}/estado`, { estado });
        assert.equal(status, 409, `${id} ${estado}`);
        assert.equal(cuerpo.codigo, 'TRANSICION_INVALIDA');
      }
      assert.deepEqual((await admin.get('/ordenes?orden=id')).cuerpo.data.map((o) => o.estado), ['entregada', 'en_reparacion', 'recibida']);
    });

    it('no acepta estados que no se pueden pedir directamente', async () => {
      for (const estado of ['asignada', 'recibida', 'volando', 7]) {
        assert.equal((await admin.put('/ordenes/3/estado', { estado })).status, 400, String(estado));
      }
      assert.equal((await admin.put('/ordenes/99/estado', { estado: 'cancelada' })).status, 404);
    });

    it('cancelar una orden recibida o en reparacion', async () => {
      assert.equal((await lucia.put('/ordenes/3/estado', { estado: 'cancelada' })).cuerpo.data.estado, 'cancelada');
      assert.equal((await lucia.put('/ordenes/2/estado', { estado: 'cancelada' })).cuerpo.data.estado, 'cancelada');
      assert.equal((await lucia.put('/ordenes/3/estado', { estado: 'cancelada' })).status, 409);
      assert.equal((await lucia.post('/ordenes', { motoId: 4, descripcion: 'Revision despues de cancelar' })).status, 201);
    });
  });

  describe('repuestos y mano de obra', () => {
    it('el mecanico asignado agrega repuestos, se descuenta el stock y se calcula el total', async () => {
      const { status, cuerpo } = await marta.post('/ordenes/2/items', { repuestoId: 4, cantidad: 2 });
      assert.equal(status, 201);
      assert.deepEqual(cuerpo.data.items, [{ repuestoId: 4, codigo: 'PAS-FRE-DL', nombre: 'Pastillas de freno delanteras', cantidad: 2, precioUnitario: 14 }]);
      assert.equal(cuerpo.data.total, 28);
      assert.equal(await stock(4), 1);
    });

    it('agregar el mismo repuesto suma la cantidad en una sola linea', async () => {
      await marta.post('/ordenes/2/items', { repuestoId: 1, cantidad: 1 });
      const { cuerpo } = await marta.post('/ordenes/2/items', { repuestoId: 1, cantidad: 3 });
      assert.equal(cuerpo.data.items.length, 1);
      assert.equal(cuerpo.data.items[0].cantidad, 4);
      assert.equal(await stock(1), 36);
    });

    it('el precio de la linea no cambia si el repuesto sube despues', async () => {
      await marta.post('/ordenes/2/items', { repuestoId: 1, cantidad: 2 });
      await admin.patch('/repuestos/1', { precio: 20 });
      const { cuerpo } = await marta.get('/ordenes/2');
      assert.equal(cuerpo.data.items[0].precioUnitario, 9.5);
      assert.equal(cuerpo.data.subtotalRepuestos, 19);
    });

    it('no deja pasarse del stock ni usar repuestos agotados o inexistentes', async () => {
      await marta.post('/ordenes/2/items', { repuestoId: 4, cantidad: 2 });
      const poco = await marta.post('/ordenes/2/items', { repuestoId: 4, cantidad: 2 });
      assert.equal(poco.status, 409);
      assert.equal(poco.cuerpo.codigo, 'STOCK_INSUFICIENTE');
      assert.equal(await stock(4), 1);
      assert.equal((await marta.post('/ordenes/2/items', { repuestoId: 6, cantidad: 1 })).cuerpo.codigo, 'STOCK_INSUFICIENTE');
      assert.equal((await marta.post('/ordenes/2/items', { repuestoId: 99, cantidad: 1 })).status, 422);
      assert.equal((await marta.get('/ordenes/2')).cuerpo.data.items[0].cantidad, 2);
    });

    it('valida el cuerpo de los repuestos', async () => {
      for (const cuerpo of [{}, { repuestoId: 1 }, { repuestoId: 1, cantidad: 0 }, { repuestoId: 1, cantidad: 101 }, { repuestoId: 1, cantidad: 1.5 }]) {
        assert.equal((await marta.post('/ordenes/2/items', cuerpo)).status, 400, JSON.stringify(cuerpo));
      }
    });

    it('solo el mecanico asignado o admin pueden editar, y solo en reparacion', async () => {
      const ajeno = await carlos.post('/ordenes/2/items', { repuestoId: 1, cantidad: 1 });
      assert.equal(ajeno.status, 403);
      assert.equal(ajeno.cuerpo.codigo, 'ORDEN_AJENA');
      assert.equal((await lucia.post('/ordenes/2/items', { repuestoId: 1, cantidad: 1 })).status, 403);
      assert.equal((await admin.post('/ordenes/2/items', { repuestoId: 1, cantidad: 1 })).status, 201);
      const sinEmpezar = await admin.post('/ordenes/3/items', { repuestoId: 1, cantidad: 1 });
      assert.equal(sinEmpezar.status, 409);
      assert.equal(sinEmpezar.cuerpo.codigo, 'ORDEN_NO_EDITABLE');
      assert.equal((await admin.post('/ordenes/1/items', { repuestoId: 1, cantidad: 1 })).cuerpo.codigo, 'ORDEN_NO_EDITABLE');
      assert.equal((await admin.post('/ordenes/99/items', { repuestoId: 1, cantidad: 1 })).status, 404);
    });

    it('quitar un repuesto lo devuelve al inventario', async () => {
      await marta.post('/ordenes/2/items', { repuestoId: 4, cantidad: 2 });
      const { status, cuerpo } = await marta.del('/ordenes/2/items/4');
      assert.equal(status, 200);
      assert.deepEqual(cuerpo.data.items, []);
      assert.equal(await stock(4), 3);
      assert.equal((await marta.del('/ordenes/2/items/4')).cuerpo.codigo, 'ITEM_NO_ENCONTRADO');
      assert.equal((await marta.del('/ordenes/2/items/x')).status, 400);
      assert.equal((await lucia.del('/ordenes/2/items/4')).status, 403);
    });

    it('registra horas acumuladas y respeta el maximo', async () => {
      assert.equal((await marta.post('/ordenes/2/horas', { horas: 1.5 })).cuerpo.data.horas, 1.5);
      const { cuerpo } = await marta.post('/ordenes/2/horas', { horas: 2 });
      assert.deepEqual([cuerpo.data.horas, cuerpo.data.manoDeObra, cuerpo.data.total], [3.5, 157.5, 157.5]);
      const exceso = await marta.post('/ordenes/2/horas', { horas: 100 });
      assert.equal(exceso.status, 422);
      assert.equal(exceso.cuerpo.codigo, 'HORAS_EXCEDIDAS');
      for (const horas of [0, 0.1, -1, '2', 101]) {
        assert.equal((await marta.post('/ordenes/2/horas', { horas })).status, 400, String(horas));
      }
      assert.equal((await carlos.post('/ordenes/2/horas', { horas: 1 })).status, 403);
    });

    it('cancelar devuelve todos los repuestos al inventario', async () => {
      await marta.post('/ordenes/2/items', { repuestoId: 4, cantidad: 2 });
      await marta.post('/ordenes/2/items', { repuestoId: 1, cantidad: 5 });
      assert.deepEqual([await stock(4), await stock(1)], [1, 35]);
      await lucia.put('/ordenes/2/estado', { estado: 'cancelada' });
      assert.deepEqual([await stock(4), await stock(1)], [3, 40]);
      assert.equal((await marta.post('/ordenes/2/items', { repuestoId: 1, cantidad: 1 })).cuerpo.codigo, 'ORDEN_NO_EDITABLE');
    });
  });

  describe('factura', () => {
    it('detalla cliente, moto, lineas y totales de una orden entregada', async () => {
      const { status, cuerpo } = await lucia.get('/ordenes/1/factura');
      assert.equal(status, 200);
      assert.deepEqual(cuerpo.data, {
        ordenId: 1,
        cliente: { id: 2, nombre: 'Ana Giron', telefono: '55505678' },
        moto: { id: 3, placa: 'M789GHI', marca: 'Suzuki', modelo: 'Gixxer' },
        lineas: [
          { codigo: 'ACE-10W40', nombre: 'Aceite 10W40 1L', cantidad: 1, precioUnitario: 9.5, subtotal: 9.5 },
          { codigo: 'FIL-ACE-01', nombre: 'Filtro de aceite', cantidad: 1, precioUnitario: 6, subtotal: 6 },
        ],
        manoDeObra: { horas: 0.5, tarifa: 45, subtotal: 22.5 },
        subtotalRepuestos: 15.5,
        total: 38,
        estado: 'entregada',
      });
    });

    it('no se emite mientras la orden no este lista y solo la ve recepcion o admin', async () => {
      for (const id of [2, 3]) {
        const { status, cuerpo } = await lucia.get(`/ordenes/${id}/factura`);
        assert.equal(status, 409);
        assert.equal(cuerpo.codigo, 'ORDEN_SIN_FACTURA');
      }
      assert.equal((await carlos.get('/ordenes/1/factura')).status, 403);
      assert.equal((await lucia.get('/ordenes/99/factura')).status, 404);
    });

    it('se emite apenas la orden queda lista', async () => {
      await marta.post('/ordenes/2/items', { repuestoId: 3, cantidad: 1 });
      await marta.post('/ordenes/2/horas', { horas: 1 });
      await marta.put('/ordenes/2/estado', { estado: 'lista' });
      const { cuerpo } = await lucia.get('/ordenes/2/factura');
      assert.deepEqual([cuerpo.data.estado, cuerpo.data.subtotalRepuestos, cuerpo.data.total], ['lista', 4.25, 49.25]);
    });
  });

  it('responde 405 con Allow en metodos no permitidos', async () => {
    const casos = [
      ['/ordenes', 'del', 'GET, POST'],
      ['/ordenes/1', 'put', 'GET'],
      ['/ordenes/1/asignacion', 'post', 'PUT'],
      ['/ordenes/1/estado', 'post', 'PUT'],
      ['/ordenes/1/items', 'get', 'POST'],
      ['/ordenes/1/items/1', 'post', 'DELETE'],
      ['/ordenes/1/horas', 'get', 'POST'],
      ['/ordenes/1/factura', 'post', 'GET'],
    ];
    for (const [ruta, metodo, permitidos] of casos) {
      const { status, cabeceras } = await admin[metodo](ruta);
      assert.equal(status, 405, `${metodo} ${ruta}`);
      assert.equal(cabeceras.get('allow'), permitidos);
    }
  });
});
