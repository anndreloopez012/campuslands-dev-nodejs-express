import { addWorkshopMotorcycle, listWorkshopMotorcycles } from '../services/workshopService.js';

export function listMotorcycles(_request, response) {
  response.json({ data: listWorkshopMotorcycles() });
}

export function createMotorcycle(request, response) {
  const { brand, model } = request.body ?? {};
  if (typeof brand !== 'string' || !brand.trim() || typeof model !== 'string' || !model.trim()) {
    return response.status(400).json({ error: 'Marca y modelo son obligatorios.' });
  }
  return response.status(201).json({ data: addWorkshopMotorcycle(brand.trim(), model.trim()) });
}
