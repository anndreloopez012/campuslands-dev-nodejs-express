const motorcycles = [
  { id: 1, brand: 'Honda', model: 'CB 190R', year: 2023 },
  { id: 2, brand: 'Suzuki', model: 'GN 125', year: 2022 }
];
const workOrders = [];
let nextMotorcycleId = 3;
let nextWorkOrderId = 1;

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function listMotorcycles() {
  return motorcycles;
}

function getMotorcycle(value) {
  const id = parseId(value);
  if (!id) return { ok: false, status: 400, error: 'El id debe ser un entero positivo' };
  const motorcycle = motorcycles.find((item) => item.id === id);
  if (!motorcycle) return { ok: false, status: 404, error: 'Motocicleta no encontrada' };
  return { ok: true, motorcycle };
}

function createMotorcycle(body = {}) {
  const { brand, model, year } = body || {};
  if (typeof brand !== 'string' || !brand.trim() || typeof model !== 'string' || !model.trim()) {
    return { ok: false, status: 400, error: 'La marca y el modelo son obligatorios' };
  }
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < 1950 || year > currentYear + 1) {
    return { ok: false, status: 400, error: `El anio debe estar entre 1950 y ${currentYear + 1}` };
  }

  const motorcycle = { id: nextMotorcycleId++, brand: brand.trim(), model: model.trim(), year };
  motorcycles.push(motorcycle);
  return { ok: true, motorcycle };
}

function listWorkOrders() {
  return workOrders;
}

function createWorkOrder(body = {}) {
  const { motorcycleId, issue } = body || {};
  const parsedMotorcycleId = parseId(motorcycleId);
  if (!parsedMotorcycleId) {
    return { ok: false, status: 400, error: 'motorcycleId debe ser un entero positivo' };
  }
  if (typeof issue !== 'string' || !issue.trim()) {
    return { ok: false, status: 400, error: 'La descripcion de la falla es obligatoria' };
  }
  const motorcycle = motorcycles.find((item) => item.id === parsedMotorcycleId);
  if (!motorcycle) return { ok: false, status: 404, error: 'Motocicleta no encontrada' };

  const workOrder = {
    id: nextWorkOrderId++,
    motorcycleId: parsedMotorcycleId,
    issue: issue.trim(),
    status: 'received'
  };
  workOrders.push(workOrder);
  return { ok: true, workOrder };
}

module.exports = { listMotorcycles, getMotorcycle, createMotorcycle, listWorkOrders, createWorkOrder };