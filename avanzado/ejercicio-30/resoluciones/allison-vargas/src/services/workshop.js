import { randomUUID } from 'node:crypto';
import { HttpError } from '../errors/http-error.js';
import { createWorkshopRepository } from '../repositories/workshop-repository.js';

const transitions = Object.freeze({ pending: new Set(['in_progress', 'cancelled']), in_progress: new Set(['completed', 'cancelled']), completed: new Set(), cancelled: new Set() });

function paginate(items, page, limit) {
  const pageNumber = Number(page ?? 1);
  const pageSize = Number(limit ?? 10);
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new HttpError(400, 'INVALID_PAGINATION', 'page debe ser positivo y limit debe estar entre 1 y 100');
  const start = (pageNumber - 1) * pageSize;
  return { data: items.slice(start, start + pageSize), pagination: { page: pageNumber, limit: pageSize, total: items.length, pages: Math.ceil(items.length / pageSize) } };
}

export function createWorkshop(repository = createWorkshopRepository()) {
  return {
    listMotorcycles(page, limit) { return paginate(repository.listMotorcycles(), page, limit); },
    createMotorcycle(input) {
      const plate = typeof input?.plate === 'string' ? input.plate.trim().toUpperCase() : '';
      const make = typeof input?.make === 'string' ? input.make.trim() : '';
      const model = typeof input?.model === 'string' ? input.model.trim() : '';
      const year = Number(input?.year);
      const currentYear = new Date().getUTCFullYear();
      if (!/^[A-Z0-9-]{3,12}$/.test(plate)) throw new HttpError(400, 'INVALID_PLATE', 'La placa debe tener entre 3 y 12 caracteres alfanuméricos o guiones');
      if (!make || make.length > 60 || !model || model.length > 60) throw new HttpError(400, 'INVALID_MOTORCYCLE', 'Marca y modelo son obligatorios y no deben superar 60 caracteres');
      if (!Number.isInteger(year) || year < 1900 || year > currentYear + 1) throw new HttpError(400, 'INVALID_YEAR', `El año debe estar entre 1900 y ${currentYear + 1}`);
      if (repository.findMotorcycleByPlate(plate)) throw new HttpError(409, 'PLATE_EXISTS', 'Ya existe una motocicleta con esa placa');
      return repository.saveMotorcycle({ id: randomUUID(), plate, make, model, year, createdAt: new Date().toISOString() });
    },
    listWorkOrders(page, limit) { return paginate(repository.listWorkOrders(), page, limit); },
    createWorkOrder(input) {
      const motorcycleId = typeof input?.motorcycleId === 'string' ? input.motorcycleId : '';
      const description = typeof input?.description === 'string' ? input.description.trim() : '';
      const estimatedCost = Number(input?.estimatedCost);
      if (!repository.findMotorcycle(motorcycleId)) throw new HttpError(404, 'MOTORCYCLE_NOT_FOUND', 'Motocicleta no encontrada');
      if (!description || description.length > 500) throw new HttpError(400, 'INVALID_DESCRIPTION', 'La descripción debe tener entre 1 y 500 caracteres');
      if (!Number.isFinite(estimatedCost) || estimatedCost < 0) throw new HttpError(400, 'INVALID_COST', 'El costo estimado debe ser un número no negativo');
      return repository.saveWorkOrder({ id: randomUUID(), motorcycleId, description, estimatedCost, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    },
    updateWorkOrderStatus(id, status) {
      const order = repository.findWorkOrder(id);
      if (!order) throw new HttpError(404, 'WORK_ORDER_NOT_FOUND', 'Orden de trabajo no encontrada');
      if (!Object.hasOwn(transitions, status) || !transitions[order.status].has(status)) throw new HttpError(409, 'INVALID_STATUS_TRANSITION', `No se puede cambiar de ${order.status} a ${String(status)}`);
      return repository.saveWorkOrder({ ...order, status, updatedAt: new Date().toISOString() });
    }
  };
}
