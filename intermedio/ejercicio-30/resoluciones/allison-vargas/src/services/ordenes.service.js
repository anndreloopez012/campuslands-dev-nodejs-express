import { ConflictError, NotFoundError, PermisoError, ReferenciaError, UnprocessableError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero, filtroEnum } from '../validators/consulta.js';
import {
  ESTADOS_FINALES,
  ESTADOS_ORDEN,
  HORAS_MAX_ORDEN,
  QUIEN_CAMBIA,
  TARIFA_HORA,
  TRANSICIONES,
} from '../constants/taller.js';

const redondear = (numero) => Math.round(numero * 100) / 100;

const configListado = {
  filtros: {
    estado: filtroEnum(ESTADOS_ORDEN),
    motoId: filtroEntero(1, 1000000),
    mecanicoId: filtroEntero(1, 1000000),
  },
  ordenes: {
    reciente: (a, b) => b.id - a.id,
    id: (a, b) => a.id - b.id,
  },
  ordenPorDefecto: 'reciente',
};

export function calcularTotales(orden) {
  const repuestos = redondear(orden.items.reduce((suma, i) => suma + i.cantidad * i.precioUnitario, 0));
  const manoDeObra = redondear(orden.horas * TARIFA_HORA);
  return { repuestos, manoDeObra, total: redondear(repuestos + manoDeObra) };
}

export function crearOrdenesService({ repositorio, motos, clientes, repuestos, usuarios, reloj = () => new Date() }) {
  const ahora = () => reloj().toISOString();

  function presentar(orden) {
    const { repuestos: subtotalRepuestos, manoDeObra, total } = calcularTotales(orden);
    return {
      id: orden.id,
      motoId: orden.motoId,
      descripcion: orden.descripcion,
      estado: orden.estado,
      mecanicoId: orden.mecanicoId,
      items: orden.items.map((i) => ({ ...i })),
      horas: orden.horas,
      subtotalRepuestos,
      manoDeObra,
      total,
      creadaEn: orden.creadaEn,
      actualizadaEn: orden.actualizadaEn,
      historial: orden.historial.map((h) => ({ ...h })),
    };
  }

  function buscarOrden(id) {
    const orden = repositorio.buscar(id);
    if (!orden) throw new NotFoundError(`No existe la orden ${id}`, 'ORDEN_NO_ENCONTRADA');
    return orden;
  }

  function exigirVisible(orden, usuario) {
    if (usuario.rol === 'mecanico' && orden.mecanicoId !== usuario.id) {
      throw new PermisoError('Esta orden no esta asignada a ti', 'ORDEN_AJENA');
    }
  }

  function exigirMecanicoDeLaOrden(orden, usuario) {
    if (usuario.rol === 'admin') return;
    if (usuario.rol === 'mecanico' && orden.mecanicoId === usuario.id) return;
    throw new PermisoError('Solo el mecanico asignado puede hacerlo', 'ORDEN_AJENA');
  }

  function guardar(orden, cambios, estado, usuario) {
    const marca = ahora();
    const historial = estado ? [...orden.historial, { estado, en: marca, por: usuario.id }] : orden.historial;
    return repositorio.actualizar(orden.id, { ...cambios, historial, actualizadaEn: marca });
  }

  function obtener(id, usuario) {
    const orden = buscarOrden(id);
    exigirVisible(orden, usuario);
    return presentar(orden);
  }

  function listar(query, usuario) {
    const consulta = leerListado(query, configListado);
    const { estado, motoId, mecanicoId } = consulta.filtros;
    const filtradas = repositorio
      .listar((o) =>
        (estado === undefined || o.estado === estado)
        && (motoId === undefined || o.motoId === motoId)
        && (mecanicoId === undefined || o.mecanicoId === mecanicoId)
        && (usuario.rol !== 'mecanico' || o.mecanicoId === usuario.id))
      .sort(consulta.comparador)
      .map(presentar);
    return paginar(filtradas, consulta.pagina, consulta.limite);
  }

  const todas = () => repositorio.listar().map(presentar);

  function crear({ motoId, descripcion }, usuario) {
    if (!motos.buscar(motoId)) throw new ReferenciaError('motoId', `No existe la moto ${motoId}`);
    const abierta = repositorio.listar((o) => o.motoId === motoId && !ESTADOS_FINALES.includes(o.estado))[0];
    if (abierta) {
      throw new ConflictError(`La moto ya tiene la orden ${abierta.id} en el taller`, 'MOTO_EN_TALLER');
    }
    const marca = ahora();
    return presentar(repositorio.crear({
      motoId,
      descripcion,
      estado: 'recibida',
      mecanicoId: null,
      items: [],
      horas: 0,
      creadaEn: marca,
      actualizadaEn: marca,
      historial: [{ estado: 'recibida', en: marca, por: usuario.id }],
    }));
  }

  function asignar(id, { mecanicoId }, usuario) {
    const orden = buscarOrden(id);
    if (!usuarios.esMecanicoActivo(mecanicoId)) {
      throw new ReferenciaError('mecanicoId', `El usuario ${mecanicoId} no es un mecanico activo`);
    }
    if (orden.estado !== 'recibida' && orden.estado !== 'asignada') {
      throw new ConflictError(`No se puede asignar una orden en estado ${orden.estado}`, 'TRANSICION_INVALIDA');
    }
    return presentar(guardar(orden, { mecanicoId, estado: 'asignada' }, 'asignada', usuario));
  }

  function permitirCambio(orden, destino, usuario) {
    if (QUIEN_CAMBIA[destino] === 'mecanico') {
      exigirMecanicoDeLaOrden(orden, usuario);
    } else if (usuario.rol !== 'admin' && usuario.rol !== 'recepcion') {
      throw new PermisoError('Solo recepcion o admin pueden hacerlo', 'PERMISOS_INSUFICIENTES');
    }
  }

  function cambiarEstado(id, { estado }, usuario) {
    const orden = buscarOrden(id);
    permitirCambio(orden, estado, usuario);
    if (!TRANSICIONES[orden.estado].includes(estado)) {
      throw new ConflictError(`No se puede pasar de ${orden.estado} a ${estado}`, 'TRANSICION_INVALIDA');
    }
    if (estado === 'cancelada') {
      for (const item of orden.items) repuestos.devolver(item.repuestoId, item.cantidad);
    }
    return presentar(guardar(orden, { estado }, estado, usuario));
  }

  function exigirEditable(orden, usuario) {
    exigirMecanicoDeLaOrden(orden, usuario);
    if (orden.estado !== 'en_reparacion') {
      throw new ConflictError('Solo se puede editar una orden en reparacion', 'ORDEN_NO_EDITABLE');
    }
  }

  function agregarItem(id, { repuestoId, cantidad }, usuario) {
    const orden = buscarOrden(id);
    exigirEditable(orden, usuario);
    const repuesto = repuestos.buscar(repuestoId);
    if (!repuesto) throw new ReferenciaError('repuestoId', `No existe el repuesto ${repuestoId}`);
    repuestos.descontar(repuestoId, cantidad);
    const existente = orden.items.find((i) => i.repuestoId === repuestoId);
    const items = existente
      ? orden.items.map((i) => (i === existente ? { ...i, cantidad: i.cantidad + cantidad } : i))
      : [...orden.items, {
        repuestoId,
        codigo: repuesto.codigo,
        nombre: repuesto.nombre,
        cantidad,
        precioUnitario: repuesto.precio,
      }];
    return presentar(guardar(orden, { items }));
  }

  function quitarItem(id, repuestoId, usuario) {
    const orden = buscarOrden(id);
    exigirEditable(orden, usuario);
    const item = orden.items.find((i) => i.repuestoId === repuestoId);
    if (!item) throw new NotFoundError(`La orden no usa el repuesto ${repuestoId}`, 'ITEM_NO_ENCONTRADO');
    repuestos.devolver(repuestoId, item.cantidad);
    return presentar(guardar(orden, { items: orden.items.filter((i) => i !== item) }));
  }

  function registrarHoras(id, { horas }, usuario) {
    const orden = buscarOrden(id);
    exigirEditable(orden, usuario);
    const total = redondear(orden.horas + horas);
    if (total > HORAS_MAX_ORDEN) {
      throw new UnprocessableError(`Una orden no puede superar ${HORAS_MAX_ORDEN} horas`, 'HORAS_EXCEDIDAS');
    }
    return presentar(guardar(orden, { horas: total }));
  }

  function factura(id) {
    const orden = buscarOrden(id);
    if (orden.estado !== 'lista' && orden.estado !== 'entregada') {
      throw new ConflictError('La factura se emite cuando la orden esta lista', 'ORDEN_SIN_FACTURA');
    }
    const moto = motos.buscar(orden.motoId);
    const cliente = clientes.buscar(moto.clienteId);
    const totales = calcularTotales(orden);
    return {
      ordenId: orden.id,
      cliente: { id: cliente.id, nombre: cliente.nombre, telefono: cliente.telefono },
      moto: { id: moto.id, placa: moto.placa, marca: moto.marca, modelo: moto.modelo },
      lineas: orden.items.map((i) => ({
        codigo: i.codigo,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
        subtotal: redondear(i.cantidad * i.precioUnitario),
      })),
      manoDeObra: { horas: orden.horas, tarifa: TARIFA_HORA, subtotal: totales.manoDeObra },
      subtotalRepuestos: totales.repuestos,
      total: totales.total,
      estado: orden.estado,
    };
  }

  function cargaMecanicos() {
    const activas = repositorio.listar((o) => !ESTADOS_FINALES.includes(o.estado));
    return usuarios.mecanicos().map((m) => ({
      ...m,
      ordenesActivas: activas.filter((o) => o.mecanicoId === m.id).length,
    }));
  }

  return {
    obtener, listar, todas, crear, asignar, cambiarEstado,
    agregarItem, quitarItem, registrarHoras, factura, cargaMecanicos,
  };
}
