import express from "express";
import { rutaNoEncontrada, manejarErrores } from "./shared/http.js";

// la app no crea nada por su cuenta: recibe el contenedor ya armado
// asi en los tests se le puede pasar otro (otro repo, otros modulos)
export function crearApp(contenedor) {
    const app = express();
    app.use(express.json({ limit: "20kb" }));

    app.get("/health", (req, res) => {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "arquitectura escalable" });
    });

    // que modulos hay y de cuales depende cada uno
    app.get("/api", (req, res) => {
        res.json({
            ok: true,
            repo: contenedor.repo,
            modulos: contenedor.modulos.map(({ nombre, ruta, necesita }) => ({ nombre, ruta: `/api${ruta}`, necesita }))
        });
    });

    // cada modulo trae su router, la app solo lo monta
    for (const modulo of contenedor.modulos) {
        app.use(`/api${modulo.ruta}`, modulo.router);
    }

    app.use(rutaNoEncontrada);
    app.use(manejarErrores);

    return app;
}
