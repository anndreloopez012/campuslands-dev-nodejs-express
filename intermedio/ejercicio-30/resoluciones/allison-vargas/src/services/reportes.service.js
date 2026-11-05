import { ESTADOS_ORDEN, STOCK_BAJO } from '../constants/taller.js';

export function crearReportesService({ ordenes, repuestos }) {
  function resumen() {
    const lista = ordenes.todas();
    const porEstado = Object.fromEntries(ESTADOS_ORDEN.map((estado) => [estado, 0]));
    for (const orden of lista) porEstado[orden.estado] += 1;

    const ingresos = lista
      .filter((o) => o.estado === 'entregada')
      .reduce((suma, o) => suma + o.total, 0);

    const bajoStock = repuestos
      .todos()
      .filter((r) => r.stock < STOCK_BAJO)
      .sort((a, b) => a.stock - b.stock || a.id - b.id)
      .map(({ id, codigo, nombre, stock }) => ({ id, codigo, nombre, stock }));

    return {
      ordenes: { total: lista.length, porEstado },
      ingresos: Math.round(ingresos * 100) / 100,
      repuestosBajoStock: bajoStock,
    };
  }

  return { resumen };
}
