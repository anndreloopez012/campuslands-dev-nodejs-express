import { workshopRepository } from '../repositories/workshop.repository.js';

export const listAllRecords = async ({ page = 1, limit = 5, tipo }) => {
  let records = await workshopRepository.findAll();

  if (tipo) {
    records = records.filter((r) => r.tipoMantenimiento.toLowerCase() === tipo.toLowerCase());
  }

  const total = records.length;
  const numLimit = Math.max(1, Number(limit));
  const numPage = Math.max(1, Number(page));
  const startIndex = (numPage - 1) * numLimit;
  const paginated = records.slice(startIndex, startIndex + numLimit);

  return {
    total,
    page: numPage,
    limit: numLimit,
    totalPages: Math.ceil(total / numLimit) || 1,
    data: paginated
  };
};

export const getRecordById = async (id) => {
  const record = await workshopRepository.findById(id);
  if (!record) {
    const error = new Error(`Orden de mantenimiento #${id} no encontrada en el taller.`);
    error.statusCode = 404;
    throw error;
  }
  return record;
};

export const createServiceRecord = async (data) => {
  return await workshopRepository.create({
    placa: data.placa.trim().toUpperCase(),
    cliente: data.cliente.trim(),
    marca: data.marca.trim(),
    modelo: data.modelo ? data.modelo.trim() : 'Estándar',
    cilindrada: Number(data.cilindrada),
    tipoMantenimiento: data.tipoMantenimiento.toLowerCase(),
    costoUSD: data.costoUSD ? Number(data.costoUSD) : 80,
    fechaIngreso: new Date().toISOString()
  });
};
