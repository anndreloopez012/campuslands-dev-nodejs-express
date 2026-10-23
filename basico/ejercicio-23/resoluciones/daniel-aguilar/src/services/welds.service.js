const { store } = require('../store/welds.store');

const PROCESSES = ['MIG', 'TIG', 'MMA', 'FCAW'];
const STATUSES = ['pendiente', 'aprobada', 'rechazada'];

function serviceError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
}

function listWelds({ process: weldProcess, status } = {}) {
  return store.all().filter((weld) => {
    if (weldProcess && weld.process !== weldProcess) return false;
    if (status && weld.status !== status) return false;
    return true;
  });
}

function getWeld(id) {
  const weld = store.find(id);
  if (!weld) throw serviceError(404, `La soldadura ${id} no existe`);
  return weld;
}

function createWeld(data) {
  const details = [];
  if (!PROCESSES.includes(data?.process)) details.push(`process debe ser uno de: ${PROCESSES.join(', ')}`);
  if (typeof data?.material !== 'string' || data.material.trim() === '') details.push('material es obligatorio');
  if (typeof data?.thicknessMm !== 'number' || !(data.thicknessMm > 0) || data.thicknessMm > 100) {
    details.push('thicknessMm debe ser un numero entre 0 y 100');
  }
  if (!Number.isInteger(data?.amperage) || data.amperage < 20 || data.amperage > 600) {
    details.push('amperage debe ser un entero entre 20 y 600');
  }
  if (data?.status !== undefined && !STATUSES.includes(data.status)) {
    details.push(`status debe ser uno de: ${STATUSES.join(', ')}`);
  }
  if (details.length > 0) throw serviceError(400, 'Datos invalidos', details);

  return store.insert({
    process: data.process,
    material: data.material.trim().toLowerCase(),
    thicknessMm: data.thicknessMm,
    amperage: data.amperage,
    status: data.status || 'pendiente',
  });
}

function getStats() {
  const welds = store.all();
  const count = (key) =>
    welds.reduce((acc, weld) => {
      acc[weld[key]] = (acc[weld[key]] || 0) + 1;
      return acc;
    }, {});
  const averageAmperage = welds.length
    ? Number((welds.reduce((sum, weld) => sum + weld.amperage, 0) / welds.length).toFixed(1))
    : 0;
  return { total: welds.length, byProcess: count('process'), byStatus: count('status'), averageAmperage };
}

const resetData = () => store.reset();

module.exports = { PROCESSES, STATUSES, listWelds, getWeld, createWeld, getStats, resetData };
