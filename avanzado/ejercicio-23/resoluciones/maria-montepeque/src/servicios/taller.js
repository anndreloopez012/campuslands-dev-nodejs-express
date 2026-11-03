// datos del taller de soldadura y las tareas que hacen los jobs

const DIA = 24 * 60 * 60 * 1000;

export function crearTaller() {
    const soldadores = [
        { id: 1, nombre: "Ramiro", proceso: "MIG", certificacionVence: "2026-11-20" },
        { id: 2, nombre: "Sofia", proceso: "TIG", certificacionVence: "2027-06-01" },
        { id: 3, nombre: "Julio", proceso: "electrodo revestido", certificacionVence: "2026-11-05" }
    ];
    const maquinas = [
        { id: "mig-01", horasUso: 480, ultimoMantenimiento: 400 },
        { id: "tig-02", horasUso: 220, ultimoMantenimiento: 200 }
    ];
    const consumos = []; // { fecha, kgElectrodo, m3Gas }
    let inspecciones = [];
    const alertas = [];

    return {
        alertas: () => alertas,
        registrarConsumo: (c) => consumos.push(c),
        agregarInspeccion: (i) => inspecciones.push(i),
        inspecciones: () => inspecciones,

        // job diario: certificaciones que vencen en menos de 30 dias
        revisarCertificaciones({ ahora }) {
            const porVencer = soldadores.filter((s) => new Date(s.certificacionVence) - ahora < 30 * DIA);
            for (const s of porVencer) {
                const dias = Math.ceil((new Date(s.certificacionVence) - ahora) / DIA);
                alertas.push({ tipo: "certificacion", fecha: ahora.toISOString(), mensaje: `${s.nombre} (${s.proceso}): su certificacion vence en ${dias} dias` });
            }
            return { revisados: soldadores.length, porVencer: porVencer.length };
        },

        // job cada hora: maquinas con mas de 50 horas desde el ultimo mantenimiento
        revisarMantenimiento({ ahora }) {
            const pendientes = maquinas.filter((m) => m.horasUso - m.ultimoMantenimiento >= 50);
            for (const m of pendientes) alertas.push({ tipo: "mantenimiento", fecha: ahora.toISOString(), mensaje: `La maquina ${m.id} lleva ${m.horasUso - m.ultimoMantenimiento} horas sin mantenimiento` });
            return { pendientes: pendientes.map((m) => m.id) };
        },

        // job diario: resumen del consumo del dia anterior
        reporteConsumo({ ahora }) {
            const ayer = new Date(ahora.getTime() - DIA).toISOString().slice(0, 10);
            const delDia = consumos.filter((c) => c.fecha.startsWith(ayer));
            return {
                dia: ayer,
                kgElectrodo: Number(delDia.reduce((t, c) => t + c.kgElectrodo, 0).toFixed(2)),
                m3Gas: Number(delDia.reduce((t, c) => t + c.m3Gas, 0).toFixed(2))
            };
        },

        // job semanal: borra inspecciones de mas de 90 dias
        limpiarInspecciones({ ahora }) {
            const antes = inspecciones.length;
            inspecciones = inspecciones.filter((i) => ahora - new Date(i.fecha) <= 90 * DIA);
            return { borradas: antes - inspecciones.length };
        }
    };
}
