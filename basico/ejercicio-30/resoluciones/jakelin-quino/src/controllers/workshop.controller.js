const workshopService = require('../services/workshop.service');

function listMotorcycles() {
  return { statusCode: 200, body: { ok: true, data: workshopService.listMotorcycles() } };
}

function getMotorcycle(id) {
  const result = workshopService.getMotorcycle(id);
  if (!result.ok) return { statusCode: result.status, body: { ok: false, error: result.error } };
  return { statusCode: 200, body: { ok: true, data: result.motorcycle } };
}

function createMotorcycle(body) {
  const result = workshopService.createMotorcycle(body);
  if (!result.ok) return { statusCode: result.status, body: { ok: false, error: result.error } };
  return { statusCode: 201, body: { ok: true, data: result.motorcycle } };
}

function listWorkOrders() {
  return { statusCode: 200, body: { ok: true, data: workshopService.listWorkOrders() } };
}

function createWorkOrder(body) {
  const result = workshopService.createWorkOrder(body);
  if (!result.ok) return { statusCode: result.status, body: { ok: false, error: result.error } };
  return { statusCode: 201, body: { ok: true, data: result.workOrder } };
}

module.exports = { listMotorcycles, getMotorcycle, createMotorcycle, listWorkOrders, createWorkOrder };