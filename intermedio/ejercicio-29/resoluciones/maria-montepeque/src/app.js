import express from "express";
import { EQUIPOS_INICIALES, PARTIDOS_INICIALES } from "./data/iniciales.js";
import { crearColeccion } from "./repositories/coleccion.js";
import { crearEquiposService } from "./services/equipos.service.js";
import { crearPartidosService } from "./services/partidos.service.js";
import { crearEquiposController } from "./controllers/equipos.controller.js";
import { crearPartidosController } from "./controllers/partidos.controller.js";
import { crearRutas } from "./routes/index.js";
import { rutaNoEncontrada, manejarErrores } from "./middlewares/errores.js";

// VERSION DESPUES DEL REFACTOR
// misma forma de uso que antes: crearApp() da una app nueva con sus datos
export function crearApp() {
    // datos
    const equipos = crearColeccion(EQUIPOS_INICIALES);
    const partidos = crearColeccion(PARTIDOS_INICIALES);

    // logica
    const equiposService = crearEquiposService({ equipos, partidos });
    const partidosService = crearPartidosService({ partidos, equiposService });

    // http
    const rutas = crearRutas({
        equipos: crearEquiposController(equiposService),
        partidos: crearPartidosController({ partidosService, equiposService })
    });

    const app = express();
    app.use(express.json());

    app.get("/health", (req, res) => {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "refactor de API" });
    });

    app.use("/api", rutas);
    app.use(rutaNoEncontrada);
    app.use(manejarErrores);

    return app;
}
