import { PRIORIDADES } from '../constants/taller.js';

export function planDeTrabajos({ ordenId, sintomas, servicios, incluirLavado, prioridad }) {
  const plan = [
    {
      clave: 'diagnostico',
      tipo: 'diagnostico',
      carga: { sintomas },
      prioridad,
      dependeDe: [],
    },
  ];
  servicios.forEach((servicio, indice) => {
    const { tipo, ...carga } = servicio;
    plan.push({ clave: `${tipo}-${indice}`, tipo, carga, prioridad, dependeDe: ['diagnostico'] });
  });
  if (incluirLavado) {
    plan.push({
      clave: 'lavado',
      tipo: 'lavado',
      carga: {},
      prioridad: PRIORIDADES.BAJA,
      dependeDe: servicios.map((_, indice) => `${servicios[indice].tipo}-${indice}`),
    });
  }
  return plan.map((paso) => ({ ...paso, claveUnica: `orden-${ordenId}-${paso.clave}` }));
}

export function resumirOrden(orden, trabajos) {
  const cuenta = (estado) => trabajos.filter((t) => t.estado === estado).length;
  const completadas = cuenta('completada');
  let estado = 'en_espera';
  if (trabajos.length > 0 && trabajos.every((t) => t.estado === 'cancelada')) estado = 'cancelada';
  else if (trabajos.some((t) => t.estado === 'muerta')) estado = 'con_problemas';
  else if (completadas === trabajos.length) estado = 'lista';
  else if (cuenta('en_proceso') > 0 || completadas > 0) estado = 'en_proceso';
  const costoTotal = trabajos.reduce((total, t) => total + (t.resultado?.costo ?? 0), 0);
  return {
    ...orden,
    estado,
    progreso: { completadas, total: trabajos.length },
    costoTotal,
    trabajos,
  };
}
