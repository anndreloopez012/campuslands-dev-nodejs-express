import { UMBRALES } from '../constants/eventos.js';

export function instalarReacciones({ bus, sesiones, records, umbrales = UMBRALES }) {
  const sobrecalentadas = new Map();
  const avisadas = new Set();

  bus.suscribir('vuelta:completada', ({ datos }) => {
    if (datos.tempMotor < umbrales.temperatura) {
      sobrecalentadas.delete(datos.sesionId);
      return;
    }
    const consecutivos = (sobrecalentadas.get(datos.sesionId) ?? 0) + 1;
    sobrecalentadas.set(datos.sesionId, consecutivos);
    bus.emitir('motor:sobrecalentado', {
      sesionId: datos.sesionId,
      vuelta: datos.vuelta,
      tempMotor: datos.tempMotor,
      consecutivos,
    });
  }, { nombre: 'termica', interna: true });

  bus.suscribir('vuelta:completada', ({ datos }) => {
    if (datos.desgaste < umbrales.desgaste || avisadas.has(datos.sesionId)) return;
    if (sesiones.obtener(datos.sesionId).estado !== 'en_pista') return;
    avisadas.add(datos.sesionId);
    bus.emitir('neumaticos:desgastados', { sesionId: datos.sesionId, vuelta: datos.vuelta, desgaste: datos.desgaste });
  }, { nombre: 'neumaticos', interna: true });

  bus.suscribir('vuelta:completada', ({ datos }) => {
    const sesion = sesiones.obtener(datos.sesionId);
    const actual = records.actual(sesion.circuitoId);
    if (datos.tiempoMs >= actual.tiempoMs) return;
    const anteriorMs = records.superar(sesion.circuitoId, {
      tiempoMs: datos.tiempoMs,
      piloto: sesion.piloto,
      auto: sesion.auto,
      sesionId: sesion.id,
      vuelta: datos.vuelta,
    });
    bus.emitir('record:nuevo', {
      sesionId: sesion.id,
      circuitoId: sesion.circuitoId,
      tiempoMs: datos.tiempoMs,
      anteriorMs,
      piloto: sesion.piloto,
      auto: sesion.auto,
      vuelta: datos.vuelta,
    });
  }, { nombre: 'cronometro', interna: true });

  bus.suscribir('motor:sobrecalentado', ({ datos }) => {
    if (datos.consecutivos >= umbrales.alertasParaAbortar) {
      sesiones.abortar(datos.sesionId, 'sobrecalentamiento del motor');
    }
  }, { nombre: 'seguridad', interna: true });

  const limpiar = ({ datos }) => {
    sobrecalentadas.delete(datos.sesionId);
    avisadas.delete(datos.sesionId);
  };
  bus.suscribir('sesion:finalizada', limpiar, { nombre: 'limpieza', interna: true });
  bus.suscribir('sesion:abortada', limpiar, { nombre: 'limpieza', interna: true });
}
