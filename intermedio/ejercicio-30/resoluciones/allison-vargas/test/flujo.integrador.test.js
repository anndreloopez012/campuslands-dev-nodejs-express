import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { levantarTaller } from '../soporte/taller.js';

describe('flujo completo del taller: de la recepcion a la entrega', () => {
  let taller;
  const estado = {};

  before(async () => {
    taller = await levantarTaller();
  });

  after(() => taller.cerrar());

  it('1. recepcion registra al cliente y su moto', async () => {
    const lucia = await taller.como('lucia');
    const cliente = await lucia.post('/clientes', { nombre: 'Sofia Mendez', telefono: '55577777', email: 'sofia@correo.com' });
    assert.equal(cliente.status, 201);
    estado.clienteId = cliente.cuerpo.data.id;
    const moto = await lucia.post('/motos', { clienteId: estado.clienteId, placa: 'm900zzz', marca: 'Yamaha', modelo: 'MT-03', cilindraje: 321, anio: 2023 });
    assert.equal(moto.status, 201);
    estado.motoId = moto.cuerpo.data.id;
    assert.equal(moto.cuerpo.data.placa, 'M900ZZZ');
  });

  it('2. abre la orden y la asigna al mecanico con menos carga', async () => {
    const lucia = await taller.como('lucia');
    const orden = await lucia.post('/ordenes', { motoId: estado.motoId, descripcion: 'Cadena floja y ruido en el motor' });
    assert.equal(orden.status, 201);
    estado.ordenId = orden.cuerpo.data.id;

    const carga = (await lucia.get('/mecanicos')).cuerpo.data;
    const elegido = [...carga].sort((a, b) => a.ordenesActivas - b.ordenesActivas || a.id - b.id)[0];
    assert.equal(elegido.nombre, 'Carlos Perez');
    estado.mecanicoId = elegido.id;

    const asignada = await lucia.put(`/ordenes/${estado.ordenId}/asignacion`, { mecanicoId: estado.mecanicoId });
    assert.equal(asignada.cuerpo.data.estado, 'asignada');
  });

  it('3. el mecanico ve la orden en su lista y empieza la reparacion', async () => {
    const carlos = await taller.como('carlos');
    const propias = await carlos.get('/ordenes?estado=asignada');
    assert.deepEqual(propias.cuerpo.data.map((o) => o.id), [estado.ordenId]);
    const inicio = await carlos.put(`/ordenes/${estado.ordenId}/estado`, { estado: 'en_reparacion' });
    assert.equal(inicio.cuerpo.data.estado, 'en_reparacion');
  });

  it('4. usa repuestos del inventario y registra horas', async () => {
    const carlos = await taller.como('carlos');
    const admin = await taller.como('admin');
    const cadena = await carlos.post(`/ordenes/${estado.ordenId}/items`, { repuestoId: 5, cantidad: 1 });
    assert.equal(cadena.status, 201);
    await carlos.post(`/ordenes/${estado.ordenId}/items`, { repuestoId: 1, cantidad: 2 });
    await carlos.post(`/ordenes/${estado.ordenId}/items`, { repuestoId: 3, cantidad: 4 });
    const sinStock = await carlos.post(`/ordenes/${estado.ordenId}/items`, { repuestoId: 6, cantidad: 1 });
    assert.equal(sinStock.cuerpo.codigo, 'STOCK_INSUFICIENTE');
    const horas = await carlos.post(`/ordenes/${estado.ordenId}/horas`, { horas: 2.5 });
    assert.equal(horas.status, 200);

    const detalle = (await carlos.get(`/ordenes/${estado.ordenId}`)).cuerpo.data;
    assert.equal(detalle.subtotalRepuestos, 32 + 19 + 17);
    assert.equal(detalle.manoDeObra, 112.5);
    assert.equal(detalle.total, 180.5);

    const stocks = await Promise.all([5, 1, 3].map(async (id) => (await admin.get(`/repuestos/${id}`)).cuerpo.data.stock));
    assert.deepEqual(stocks, [7, 38, 26]);
  });

  it('5. se corrige un error: se devuelve una bujia sobrante', async () => {
    const carlos = await taller.como('carlos');
    const quitar = await carlos.del(`/ordenes/${estado.ordenId}/items/3`);
    assert.equal(quitar.status, 200);
    assert.equal(quitar.cuerpo.data.total, 32 + 19 + 112.5);
    const admin = await taller.como('admin');
    assert.equal((await admin.get('/repuestos/3')).cuerpo.data.stock, 30);
  });

  it('6. mientras no este lista no hay factura', async () => {
    const lucia = await taller.como('lucia');
    assert.equal((await lucia.get(`/ordenes/${estado.ordenId}/factura`)).cuerpo.codigo, 'ORDEN_SIN_FACTURA');
  });

  it('7. el mecanico termina y recepcion factura y entrega', async () => {
    const carlos = await taller.como('carlos');
    const lucia = await taller.como('lucia');
    assert.equal((await carlos.put(`/ordenes/${estado.ordenId}/estado`, { estado: 'lista' })).status, 200);

    const factura = (await lucia.get(`/ordenes/${estado.ordenId}/factura`)).cuerpo.data;
    assert.equal(factura.cliente.nombre, 'Sofia Mendez');
    assert.equal(factura.moto.placa, 'M900ZZZ');
    assert.deepEqual(factura.lineas.map((l) => [l.codigo, l.cantidad, l.subtotal]), [['CAD-520-X', 1, 32], ['ACE-10W40', 2, 19]]);
    assert.equal(factura.total, 163.5);

    assert.equal((await carlos.put(`/ordenes/${estado.ordenId}/estado`, { estado: 'entregada' })).status, 403);
    const entrega = await lucia.put(`/ordenes/${estado.ordenId}/estado`, { estado: 'entregada' });
    assert.equal(entrega.cuerpo.data.estado, 'entregada');
    assert.deepEqual(entrega.cuerpo.data.historial.map((h) => h.estado), ['recibida', 'asignada', 'en_reparacion', 'lista', 'entregada']);
  });

  it('8. la orden entregada ya no se modifica y la moto puede volver al taller', async () => {
    const carlos = await taller.como('carlos');
    const lucia = await taller.como('lucia');
    assert.equal((await carlos.post(`/ordenes/${estado.ordenId}/horas`, { horas: 1 })).cuerpo.codigo, 'ORDEN_NO_EDITABLE');
    assert.equal((await lucia.put(`/ordenes/${estado.ordenId}/estado`, { estado: 'cancelada' })).status, 409);
    const nueva = await lucia.post('/ordenes', { motoId: estado.motoId, descripcion: 'Revision de garantia' });
    assert.equal(nueva.status, 201);
  });

  it('9. el administrador ve el resultado en el resumen', async () => {
    const admin = await taller.como('admin');
    const { cuerpo } = await admin.get('/reportes/resumen');
    assert.equal(cuerpo.data.ingresos, 38 + 163.5);
    assert.equal(cuerpo.data.ordenes.total, 5);
    assert.equal(cuerpo.data.ordenes.porEstado.entregada, 2);
    assert.equal(cuerpo.data.ordenes.porEstado.recibida, 2);
  });
});
