import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { crearAuthService } from '../src/services/auth.service.js';
import { crearOrdenesService, calcularTotales } from '../src/services/ordenes.service.js';
import { crearReportesService } from '../src/services/reportes.service.js';
import { MemoryRepository } from '../src/repositories/memory.repository.js';
import { crearTokens } from '../src/utils/tokens.js';
import { hashPassword } from '../src/utils/password.js';

const AHORA = new Date('2026-11-04T12:00:00.000Z');
const admin = { id: 1, rol: 'admin' };
const carlos = { id: 3, rol: 'mecanico' };

describe('servicio de autenticacion con repositorio falso', () => {
  const tokens = crearTokens({ secreto: 's', duracionSeg: 60, reloj: () => AHORA });
  const usuario = { id: 5, usuario: 'ana', nombre: 'Ana', rol: 'mecanico', activo: true, passwordHash: hashPassword('Clave1234') };

  it('rechaza un token de un usuario desactivado o que ya no existe', () => {
    const activo = new MemoryRepository([usuario]);
    const auth = crearAuthService({ repositorio: activo, tokens });
    const { token } = auth.login({ usuario: 'ana', password: 'Clave1234' });
    assert.equal(auth.autenticar(token).id, 5);

    const desactivado = crearAuthService({ repositorio: new MemoryRepository([{ ...usuario, activo: false }]), tokens });
    assert.throws(() => desactivado.autenticar(token), { codigo: 'TOKEN_INVALIDO' });
    const vacio = crearAuthService({ repositorio: new MemoryRepository([]), tokens });
    assert.throws(() => vacio.autenticar(token), { codigo: 'TOKEN_INVALIDO' });
  });
});

describe('servicio de ordenes con dependencias falsas', () => {
  const orden = (extra = {}) => ({
    id: 1, motoId: 1, descripcion: 'Revision', estado: 'en_reparacion', mecanicoId: 3,
    items: [{ repuestoId: 2, codigo: 'R2', nombre: 'Filtro', cantidad: 2, precioUnitario: 6.5 }],
    horas: 1.5, creadaEn: AHORA.toISOString(), actualizadaEn: AHORA.toISOString(), historial: [], ...extra,
  });

  function armar(inicial = [orden()]) {
    const repuestos = {
      buscar: mock.fn(() => ({ id: 2, codigo: 'R2', nombre: 'Filtro', precio: 6.5, stock: 10 })),
      descontar: mock.fn(),
      devolver: mock.fn(),
    };
    const servicio = crearOrdenesService({
      repositorio: new MemoryRepository(inicial),
      motos: { buscar: () => ({ id: 1, clienteId: 1, placa: 'P1', marca: 'M', modelo: 'X' }) },
      clientes: { buscar: () => ({ id: 1, nombre: 'Cliente', telefono: '55500000' }) },
      repuestos,
      usuarios: { esMecanicoActivo: () => true, mecanicos: () => [{ id: 3, nombre: 'Carlos' }] },
      reloj: () => AHORA,
    });
    return { servicio, repuestos };
  }

  it('calcula repuestos, mano de obra y total con dos decimales', () => {
    assert.deepEqual(calcularTotales(orden()), { repuestos: 13, manoDeObra: 67.5, total: 80.5 });
    assert.deepEqual(calcularTotales(orden({ items: [], horas: 0 })), { repuestos: 0, manoDeObra: 0, total: 0 });
    assert.deepEqual(
      calcularTotales(orden({ items: [{ cantidad: 3, precioUnitario: 0.1 }], horas: 0.25 })),
      { repuestos: 0.3, manoDeObra: 11.25, total: 11.55 },
    );
  });

  it('cancelar devuelve al inventario cada repuesto usado', () => {
    const { servicio, repuestos } = armar();
    const cancelada = servicio.cambiarEstado(1, { estado: 'cancelada' }, { id: 2, rol: 'recepcion' });
    assert.equal(cancelada.estado, 'cancelada');
    assert.equal(repuestos.devolver.mock.callCount(), 1);
    assert.deepEqual(repuestos.devolver.mock.calls[0].arguments, [2, 2]);
  });

  it('una transicion rechazada no toca el inventario ni la orden', () => {
    const { servicio, repuestos } = armar([orden({ estado: 'lista' })]);
    assert.throws(() => servicio.cambiarEstado(1, { estado: 'cancelada' }, admin), { codigo: 'TRANSICION_INVALIDA' });
    assert.equal(repuestos.devolver.mock.callCount(), 0);
    assert.equal(servicio.obtener(1, admin).estado, 'lista');
    assert.equal(servicio.obtener(1, admin).historial.length, 0);
  });

  it('agregar un repuesto agotado falla antes de modificar la orden', () => {
    const { servicio, repuestos } = armar();
    repuestos.descontar.mock.mockImplementation(() => {
      const error = new Error('sin stock');
      error.codigo = 'STOCK_INSUFICIENTE';
      throw error;
    });
    assert.throws(() => servicio.agregarItem(1, { repuestoId: 2, cantidad: 1 }, carlos), { codigo: 'STOCK_INSUFICIENTE' });
    assert.equal(servicio.obtener(1, admin).items[0].cantidad, 2);
  });

  it('registra quien y cuando hizo cada cambio de estado', () => {
    const { servicio } = armar();
    const lista = servicio.cambiarEstado(1, { estado: 'lista' }, carlos);
    assert.deepEqual(lista.historial, [{ estado: 'lista', en: AHORA.toISOString(), por: 3 }]);
  });

  it('la carga de mecanicos cuenta solo las ordenes activas', () => {
    const { servicio } = armar([orden(), orden({ id: 2, estado: 'entregada' }), orden({ id: 3, estado: 'asignada' })]);
    assert.deepEqual(servicio.cargaMecanicos(), [{ id: 3, nombre: 'Carlos', ordenesActivas: 2 }]);
  });
});

describe('servicio de reportes con dependencias falsas', () => {
  it('suma solo lo entregado y lista los repuestos con poco stock', () => {
    const ordenes = {
      todas: () => [
        { estado: 'entregada', total: 38.1 },
        { estado: 'entregada', total: 10.2 },
        { estado: 'lista', total: 500 },
        { estado: 'cancelada', total: 99 },
      ],
    };
    const repuestos = {
      todos: () => [
        { id: 1, codigo: 'A', nombre: 'A', stock: 40 },
        { id: 2, codigo: 'B', nombre: 'B', stock: 4 },
        { id: 3, codigo: 'C', nombre: 'C', stock: 0 },
        { id: 4, codigo: 'D', nombre: 'D', stock: 5 },
      ],
    };
    const resumen = crearReportesService({ ordenes, repuestos }).resumen();
    assert.equal(resumen.ingresos, 48.3);
    assert.deepEqual(resumen.ordenes, {
      total: 4,
      porEstado: { recibida: 0, asignada: 0, en_reparacion: 0, lista: 1, entregada: 2, cancelada: 1 },
    });
    assert.deepEqual(resumen.repuestosBajoStock.map((r) => r.codigo), ['C', 'B']);
  });
});
