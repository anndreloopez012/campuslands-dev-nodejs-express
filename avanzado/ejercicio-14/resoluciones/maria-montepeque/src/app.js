import express from "express";
import { monitorEventLoopDelay } from "node:perf_hooks";
import { crearRegistro } from "./metricas/registro.js";
import { aPrometheus, aJson } from "./metricas/formatos.js";
import { middlewareMetricas } from "./metricas/http.js";
import { crearBiblioteca } from "./servicios/biblioteca.js";

export function crearApp({ tokenMetricas = process.env.METRICS_TOKEN } = {}) {
    const registro = crearRegistro();

    // --- metricas HTTP ---
    const peticiones = registro.contador("http_requests_total", "Peticiones HTTP atendidas", ["metodo", "ruta", "status"]);
    const duracion = registro.histograma("http_request_duration_seconds", "Duracion de las peticiones HTTP en segundos", ["metodo", "ruta"]);
    const enCurso = registro.medidor("http_requests_in_flight", "Peticiones que se estan atendiendo ahora");

    // --- metricas del negocio ---
    const prestamosTotal = registro.contador("biblioteca_prestamos_total", "Libros prestados", ["genero"]);
    const devolucionesTotal = registro.contador("biblioteca_devoluciones_total", "Libros devueltos", ["genero"]);
    const rechazosTotal = registro.contador("biblioteca_rechazos_total", "Prestamos o devoluciones rechazados", ["motivo"]);
    const prestamosActivos = registro.medidor("biblioteca_prestamos_activos", "Libros prestados en este momento");

    const biblioteca = crearBiblioteca({ prestamosTotal, devolucionesTotal, rechazosTotal, prestamosActivos });
    registro.medidor("biblioteca_disponibles", "Copias disponibles por genero", ["genero"], { calcular: biblioteca.disponiblesPorGenero });

    // --- metricas del proceso (se calculan al leerlas) ---
    const retraso = monitorEventLoopDelay({ resolution: 20 });
    retraso.enable();
    const inicio = Date.now();
    registro.medidor("process_resident_memory_bytes", "Memoria del proceso", [], { calcular: () => [{ etiquetas: {}, valor: process.memoryUsage().rss }] });
    registro.medidor("process_uptime_seconds", "Segundos desde que arranco", [], { calcular: () => [{ etiquetas: {}, valor: Math.round((Date.now() - inicio) / 1000) }] });
    // si el event loop se traba (algo sincrono pesado), este numero sube
    registro.medidor("nodejs_eventloop_lag_p99_seconds", "Retraso del event loop (p99)", [], { calcular: () => [{ etiquetas: {}, valor: retraso.percentile(99) / 1e9 }] });

    const app = express();
    app.use(middlewareMetricas({ peticiones, duracion, enCurso }));
    app.use(express.json());

    // las metricas pueden mostrar cosas internas: si hay token, se pide
    const protegerMetricas = (req, res, next) => {
        if (tokenMetricas && req.get("Authorization") !== `Bearer ${tokenMetricas}`) {
            return res.status(401).json({ ok: false, message: "Falta el token de metricas" });
        }
        next();
    };

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "metricas simples" }));

    app.get("/api/libros", (req, res) => res.json({ ok: true, data: biblioteca.listar() }));
    app.get("/api/libros/:id", (req, res) => res.json({ ok: true, data: biblioteca.ver(Number(req.params.id)) }));
    app.post("/api/libros/:id/prestar", (req, res) => res.json({ ok: true, data: biblioteca.prestar(Number(req.params.id)) }));
    app.post("/api/libros/:id/devolver", (req, res) => res.json({ ok: true, data: biblioteca.devolver(Number(req.params.id)) }));

    // para que la lea Prometheus
    app.get("/metrics", protegerMetricas, (req, res) => {
        res.type("text/plain; version=0.0.4").send(aPrometheus(registro));
    });
    // para leer a mano, con percentiles
    app.get("/api/metricas", protegerMetricas, (req, res) => res.json({ ok: true, data: aJson(registro) }));

    // ruta para probar los percentiles con peticiones lentas
    app.get("/api/lento", async (req, res) => {
        await new Promise((r) => setTimeout(r, Math.min(Number(req.query.ms) || 0, 2000)));
        res.json({ ok: true });
    });

    app.use((req, res) => res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` }));
    app.use((err, req, res, next) => {
        if (err.status) return res.status(err.status).json({ ok: false, message: err.message });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    app.locals.registro = registro;
    app.locals.detener = () => retraso.disable();
    return app;
}
