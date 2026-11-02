const { AppError, badRequest, notFound, conflict } = require('../utils/app-error');

const STATUSES = ['pendiente', 'en_proceso', 'finalizada'];
// Flujo permitido: cada estado solo puede avanzar al siguiente.
const NEXT_STATUS = { pendiente: 'en_proceso', en_proceso: 'finalizada', finalizada: null };

function createOrderService({ getMotorcycle }) {
  const orders = [];
  let nextId = 1;

  function get(id) {
    const order = orders.find((item) => item.id === id);
    if (!order) throw notFound(`La orden ${id} no existe`);
    return order;
  }

  const list = ({ status, motorcycleId } = {}) =>
    orders.filter((order) => (!status || order.status === status) && (!motorcycleId || order.motorcycleId === motorcycleId));

  function create(data) {
    const details = [];
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw badRequest('Datos invalidos', ['El cuerpo debe ser un objeto JSON']);
    if (!Number.isInteger(data.motorcycleId) || data.motorcycleId <= 0) details.push('motorcycleId debe ser un entero positivo');
    if (typeof data.description !== 'string' || data.description.trim().length < 5) details.push('description debe tener al menos 5 caracteres');
    if (typeof data.estimatedCostUsd !== 'number' || !(data.estimatedCostUsd >= 0)) details.push('estimatedCostUsd debe ser un numero mayor o igual a 0');
    if (details.length > 0) throw badRequest('Datos invalidos', details);

    try {
      getMotorcycle(data.motorcycleId);
    } catch {
      // La referencia dentro del cuerpo no existe: la peticion es valida pero inconsistente.
      throw new AppError(422, 'INVALID_REFERENCE', `La motocicleta ${data.motorcycleId} no existe`);
    }

    const order = {
      id: nextId,
      motorcycleId: data.motorcycleId,
      description: data.description.trim(),
      estimatedCostUsd: data.estimatedCostUsd,
      finalCostUsd: null,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    };
    nextId += 1;
    orders.push(order);
    return order;
  }

  function advance(id, body) {
    const order = get(id);
    const target = body?.status;
    if (!STATUSES.includes(target)) throw badRequest('Datos invalidos', [`status debe ser uno de: ${STATUSES.join(', ')}`]);
    if (NEXT_STATUS[order.status] !== target) {
      const allowed = NEXT_STATUS[order.status];
      throw conflict(
        allowed
          ? `Desde "${order.status}" solo se puede pasar a "${allowed}"`
          : `La orden ya esta "${order.status}" y no admite mas cambios`
      );
    }
    if (target === 'finalizada') {
      if (typeof body.finalCostUsd !== 'number' || !(body.finalCostUsd >= 0)) {
        throw badRequest('Datos invalidos', ['finalCostUsd es obligatorio al finalizar (numero >= 0)']);
      }
      order.finalCostUsd = body.finalCostUsd;
    }
    order.status = target;
    return order;
  }

  const hasOpenOrders = (motorcycleId) =>
    orders.some((order) => order.motorcycleId === motorcycleId && order.status !== 'finalizada');

  function stats() {
    const byStatus = { pendiente: 0, en_proceso: 0, finalizada: 0 };
    let revenue = 0;
    for (const order of orders) {
      byStatus[order.status] += 1;
      if (order.status === 'finalizada') revenue += order.finalCostUsd;
    }
    return { totalOrders: orders.length, byStatus, revenueUsd: Number(revenue.toFixed(2)) };
  }

  return { STATUSES, list, get, create, advance, hasOpenOrders, stats };
}

module.exports = { createOrderService };
