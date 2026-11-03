import { percentil } from "./registro.js";

// formato de texto de Prometheus:
//   # HELP http_requests_total Peticiones atendidas
//   # TYPE http_requests_total counter
//   http_requests_total{metodo="GET",ruta="/api/libros",status="200"} 12

const escapar = (v) => String(v).replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", "\\n");
const etiquetasTexto = (etqs) => {
    const partes = Object.entries(etqs).map(([k, v]) => `${k}="${escapar(v)}"`);
    return partes.length ? `{${partes.join(",")}}` : "";
};

export function aPrometheus(registro) {
    const lineas = [];

    for (const [nombre, m] of registro.metricas()) {
        lineas.push(`# HELP ${nombre} ${m.ayuda}`);
        lineas.push(`# TYPE ${nombre} ${m.tipo}`);

        if (m.tipo === "histogram") {
            for (const s of m.muestras()) {
                m.baldes.forEach((limite, i) => {
                    lineas.push(`${nombre}_bucket${etiquetasTexto({ ...s.etiquetas, le: limite })} ${s.cuentas[i]}`);
                });
                // +Inf siempre es el total
                lineas.push(`${nombre}_bucket${etiquetasTexto({ ...s.etiquetas, le: "+Inf" })} ${s.total}`);
                lineas.push(`${nombre}_sum${etiquetasTexto(s.etiquetas)} ${s.suma}`);
                lineas.push(`${nombre}_count${etiquetasTexto(s.etiquetas)} ${s.total}`);
            }
        } else {
            for (const s of m.muestras()) lineas.push(`${nombre}${etiquetasTexto(s.etiquetas)} ${s.valor}`);
        }
    }

    return lineas.join("\n") + "\n";
}

// version JSON para leer facil, con percentiles
export function aJson(registro) {
    const salida = {};
    for (const [nombre, m] of registro.metricas()) {
        if (m.tipo === "histogram") {
            salida[nombre] = m.muestras().map((s) => ({
                etiquetas: s.etiquetas,
                total: s.total,
                promedio: s.total ? redondear(s.suma / s.total) : 0,
                p50: redondear(percentil(s.recientes, 50)),
                p95: redondear(percentil(s.recientes, 95)),
                p99: redondear(percentil(s.recientes, 99))
            }));
        } else {
            salida[nombre] = m.muestras().map((s) => ({ etiquetas: s.etiquetas, valor: s.valor }));
        }
    }
    return salida;
}

const redondear = (n) => Math.round(n * 10000) / 10000;
