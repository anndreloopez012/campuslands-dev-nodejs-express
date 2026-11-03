import { addMotorcycleMaintenance, listMotorcycleMaintenance } from '../services/workshopService.js';

export function listMaintenance(request, response) {
  const result = listMotorcycleMaintenance(Number(request.params.id));
  if (!result) return response.status(404).json({ error: 'Motocicleta no encontrada.' });
  return response.json({ data: result });
}

export function createMaintenance(request, response) {
  const description = request.body?.description;
  if (typeof description !== 'string' || !description.trim()) return response.status(400).json({ error: 'La descripción es obligatoria.' });
  const record = addMotorcycleMaintenance(Number(request.params.id), description.trim());
  if (!record) return response.status(404).json({ error: 'Motocicleta no encontrada.' });
  return response.status(201).json({ data: record });
}
