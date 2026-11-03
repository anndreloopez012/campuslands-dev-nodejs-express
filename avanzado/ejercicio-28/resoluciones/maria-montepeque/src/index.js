import { crearApp } from "./app.js";
import { crearServidor } from "./servidor.js";

// index.js: el punto de entrada. Aqui (y solo aqui) se toca el proceso:
// variables de entorno, senales y process.exit
const servidor = crearServidor(crearApp(), {
    puerto: Number(process.env.PORT) || 4028,
    host: process.env.HOST || "0.0.0.0",
    tiempoApagadoMs: Number(process.env.TIEMPO_APAGADO_MS) || 10_000,
    log: (msg) => console.log(`[servidor] ${msg}`)
});

try {
    await servidor.iniciar();
} catch (err) {
    console.error(`[servidor] no pudo iniciar: ${err.message}`);
    process.exit(1);
}

async function apagar(motivo, codigo = 0) {
    console.log(`[servidor] recibi ${motivo}`);
    const { forzado } = await servidor.detener();
    process.exit(forzado ? 1 : codigo);
}

// Ctrl+C en la terminal y la senal que mandan Docker / Kubernetes al parar
process.once("SIGINT", () => apagar("SIGINT"));
process.once("SIGTERM", () => apagar("SIGTERM"));

// un error que nadie atrapo: se registra y se apaga ordenado (el proceso quedo en estado dudoso)
process.once("uncaughtException", (err) => {
    console.error("[servidor] error no controlado:", err);
    apagar("uncaughtException", 1);
});
process.once("unhandledRejection", (err) => {
    console.error("[servidor] promesa rechazada sin catch:", err);
    apagar("unhandledRejection", 1);
});
