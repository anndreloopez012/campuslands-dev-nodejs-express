import { crearApp } from "./app.js";

const PORT = process.env.PORT || 4006;
const app = crearApp({ cola: { concurrencia: 2, backoffBaseMs: 1000, timeoutMs: 5000 } });

const servidor = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// al apagar (Ctrl+C) dejo de recibir peticiones y espero las tareas que se estan haciendo
async function apagar() {
    console.log("Apagando: esperando las tareas en proceso...");
    servidor.close();
    await app.locals.cola.cerrar();
    console.log("Listo");
    process.exit(0);
}

process.on("SIGINT", apagar);
process.on("SIGTERM", apagar);
