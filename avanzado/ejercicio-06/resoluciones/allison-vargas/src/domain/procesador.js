import { SIN_RESPUESTA, FalloDeProceso, ejecutarProceso } from './procesos.js';

export function ejecutarProcesador({ cola, trabajadores, max }) {
  const salidas = [];
  let avanzo = true;
  while (avanzo && salidas.length < max) {
    avanzo = false;
    for (const trabajador of trabajadores) {
      if (salidas.length >= max) break;
      const ocupados = cola.listar({ estado: 'en_proceso', trabajadorId: trabajador.id }).length;
      if (ocupados >= trabajador.capacidad) continue;
      const [trabajo] = cola.reclamar(trabajador.id, { tipos: trabajador.habilidades, max: 1 });
      if (!trabajo) continue;
      avanzo = true;
      salidas.push(atender(cola, trabajador, trabajo));
    }
  }
  return salidas;
}

function atender(cola, trabajador, trabajo) {
  const base = { trabajoId: trabajo.id, tipo: trabajo.tipo, trabajadorId: trabajador.id, intento: trabajo.intentos };
  try {
    const resultado = ejecutarProceso(trabajo);
    if (resultado === SIN_RESPUESTA) return { ...base, resultado: 'sin_respuesta' };
    cola.completar(trabajo.id, trabajo.token, resultado);
    return { ...base, resultado: 'completada' };
  } catch (error) {
    if (!(error instanceof FalloDeProceso)) throw error;
    const actualizado = cola.fallar(trabajo.id, trabajo.token, { mensaje: error.message });
    return { ...base, resultado: 'fallida', estado: actualizado.estado, mensaje: error.message };
  }
}
