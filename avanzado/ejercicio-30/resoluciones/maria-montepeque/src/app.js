import express from "express";
import { randomUUID } from "node:crypto";
import { leerConfig } from "./config.js";
import { crearOrdenesController } from "./controllers/ordenes.controller.js";
import { crearTallerController } from "./controllers/taller.controller.js";
import { crearStore } from "./data/store.js";
import { manejarErrores, noEncontrada } from "./middlewares/errores.js";
import { crearRutas } from "./routes/index.js";
import { crearAuditoriaService } from "./services/auditoria.service.js";
import { crearAuthService } from "./services/auth.service.js";
import { crearMotosService } from "./services/motos.service.js";
import { crearOrdenesService } from "./services/ordenes.service.js";
import { crearRepuestosService } from "./services/repuestos.service.js";

// arma toda la app: datos -> servicios -> controladores -> rutas
// todo se puede inyectar para los tests (config, store, reloj, log)
export function crearApp({ config = leerConfig(), store = crearStore(), reloj, log = (l) => console.error(JSON.stringify(l)) } = {}) {
    const auth = crearAuthService(store, config);
    const auditoria = crearAuditoriaService(store, { reloj });
    const motos = crearMotosService(store);
    const repuestos = crearRepuestosService(store);
    const ordenes = crearOrdenesService({ store, motos, repuestos, auditoria, config, reloj });

    const app = express();
    app.disable("x-powered-by");
    app.use((req, res, next) => {
        res.set("X-Request-Id", randomUUID());
        res.set("X-Content-Type-Options", "nosniff");
        next();
    });
    app.use(express.json({ limit: "20kb" }));

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "proyecto final avanzado" }));
    app.use(
        "/api",
        crearRutas({
            auth,
            ordenesCtrl: crearOrdenesController(ordenes),
            tallerCtrl: crearTallerController({ auth, motos, repuestos })
        })
    );

    app.use(noEncontrada);
    app.use(manejarErrores(log));

    app.locals.store = store;
    return app;
}
