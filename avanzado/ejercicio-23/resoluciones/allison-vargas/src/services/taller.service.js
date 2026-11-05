import { crear } from '../errores/index.js';

const DIA = 24 * 60 * 60 * 1000;
const fechaDe = (texto) => new Date(`${texto}T00:00:00Z`);

export function crearServicioTaller({ datos, reloj }) {
  const maquinas = structuredClone(datos.maquinas);
  const soldadores = structuredClone(datos.soldadores);
  const consumibles = structuredClone(datos.consumibles);
  const alertas = [];
  const ordenes = [];
  let siguienteAlerta = 1;
  let siguienteOrden = 1;

  const buscar = (lista, id, codigo, campo) => {
    const encontrado = lista.find((x) => x.id === id);
    if (!encontrado) throw crear(codigo, { [campo]: id });
    return encontrado;
  };

  // no repite una alerta abierta para lo mismo: los jobs se pueden correr muchas veces sin duplicar
  function alertar(tipo, clave, mensaje) {
    if (alertas.some((a) => a.clave === clave && a.estado === 'abierta')) return false;
    alertas.push({
      id: siguienteAlerta, tipo, clave, mensaje, estado: 'abierta', creadaEn: reloj().toISOString(), resueltaEn: null,
    });
    siguienteAlerta += 1;
    return true;
  }

  const tareas = {
    revisarMantenimiento() {
      let nuevas = 0;
      for (const m of maquinas) {
        const uso = m.horasDesdeMantenimiento / m.limiteHoras;
        if (uso >= 1) nuevas += alertar('mantenimiento', `mant-${m.id}`, `${m.nombre} supero ${m.limiteHoras} horas: detener y mantener`);
        else if (uso >= 0.9) nuevas += alertar('mantenimiento', `mant-${m.id}`, `${m.nombre} esta al ${Math.round(uso * 100)}% de su limite`);
      }
      return { revisadas: maquinas.length, alertasNuevas: nuevas };
    },

    revisarCertificaciones({ ahora }) {
      let porVencer = 0;
      let suspendidas = 0;
      for (const s of soldadores) {
        for (const c of s.certificaciones) {
          const vence = fechaDe(c.vence);
          if (vence <= ahora) {
            if (!c.suspendida) {
              c.suspendida = true;
              suspendidas += 1;
            }
            alertar('certificacion', `cert-${s.id}-${c.proceso}`, `${s.nombre} tiene vencida la certificacion ${c.proceso}`);
          } else if (vence - ahora <= 30 * DIA) {
            porVencer += alertar('certificacion', `cert-${s.id}-${c.proceso}`, `${s.nombre}: la certificacion ${c.proceso} vence el ${c.vence}`);
          }
        }
      }
      return { porVencer, suspendidas };
    },

    reponerConsumibles() {
      let creadas = 0;
      for (const c of consumibles) {
        const pendiente = ordenes.some((o) => o.consumibleId === c.id && o.estado === 'pendiente');
        if (c.stock < c.minimo && !pendiente) {
          ordenes.push({
            id: siguienteOrden, consumibleId: c.id, cantidad: c.reposicion, unidad: c.unidad, estado: 'pendiente', creadaEn: reloj().toISOString(),
          });
          siguienteOrden += 1;
          creadas += 1;
        }
      }
      return { ordenesCreadas: creadas };
    },

    limpiarAlertas({ ahora }) {
      const antes = alertas.length;
      const limite = ahora.getTime() - 7 * DIA;
      for (let i = alertas.length - 1; i >= 0; i -= 1) {
        if (alertas[i].estado === 'resuelta' && Date.parse(alertas[i].resueltaEn) < limite) alertas.splice(i, 1);
      }
      return { eliminadas: antes - alertas.length };
    },
  };

  return {
    tareas,
    maquinas: () => maquinas,
    soldadores: () => soldadores,
    consumibles: () => consumibles,
    alertas: (estado) => alertas.filter((a) => !estado || a.estado === estado),
    ordenes: () => ordenes,

    registrarUso(id, horas) {
      const m = buscar(maquinas, id, 'MAQUINA_NO_ENCONTRADA', 'maquinaId');
      m.horasDesdeMantenimiento += horas;
      return m;
    },
    mantener(id) {
      const m = buscar(maquinas, id, 'MAQUINA_NO_ENCONTRADA', 'maquinaId');
      m.horasDesdeMantenimiento = 0;
      m.ultimoMantenimiento = reloj().toISOString();
      for (const a of alertas) if (a.clave === `mant-${id}` && a.estado === 'abierta') Object.assign(a, { estado: 'resuelta', resueltaEn: reloj().toISOString() });
      return m;
    },
    consumir(id, cantidad) {
      const c = buscar(consumibles, id, 'CONSUMIBLE_NO_ENCONTRADO', 'consumibleId');
      if (cantidad > c.stock) throw crear('STOCK_INSUFICIENTE', { stock: c.stock, unidad: c.unidad });
      c.stock -= cantidad;
      return c;
    },
    resolverAlerta(id) {
      const a = buscar(alertas, id, 'ALERTA_NO_ENCONTRADA', 'alertaId');
      if (a.estado === 'abierta') Object.assign(a, { estado: 'resuelta', resueltaEn: reloj().toISOString() });
      return a;
    },
  };
}

export const JOBS_DEL_TALLER = [
  {
    nombre: 'revisar-mantenimiento', cron: '0 7 * * *', descripcion: 'Todos los dias a las 07:00 revisa horas de uso de las maquinas', tarea: 'revisarMantenimiento',
  },
  {
    nombre: 'vencimiento-certificaciones', cron: '0 8 * * 1', descripcion: 'Los lunes a las 08:00 avisa certificaciones por vencer y suspende las vencidas', tarea: 'revisarCertificaciones',
  },
  {
    nombre: 'reponer-consumibles', cron: '*/30 6-20 * * 1-6', descripcion: 'Cada 30 minutos en horario de taller (lunes a sabado) crea ordenes de compra', tarea: 'reponerConsumibles',
  },
  {
    nombre: 'limpiar-alertas', cron: '0 3 * * *', descripcion: 'A las 03:00 borra alertas resueltas hace mas de 7 dias', tarea: 'limpiarAlertas',
  },
];
