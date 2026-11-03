import http from "node:http";
import { crearApp } from "./app.js";
import { ErrorConfig, leerConfig } from "./config.js";

const log = (nivel, mensaje, extra = {}) => process.stdout.write(`${JSON.stringify({ nivel, fecha: new Date().toISOString(), mensaje, ...extra })}\n`);

let config;
try {
    config = leerConfig();
} catch (err) {
    if (!(err instanceof ErrorConfig)) throw err;
    log("error", err.message);
    process.exit(1);
}

const app = crearApp(config);
const servidor = http.createServer(app);

// detras de un balanceador las conexiones keep-alive deben durar mas que las del balanceador
servidor.keepAliveTimeout = 65_000;
servidor.headersTimeout = 66_000;

servidor.on("error", (err) => {
    log("error", err.code === "EADDRINUSE" ? `El puerto ${config.puerto} ya esta en uso` : err.message);
    process.exit(1);
});

servidor.listen(config.puerto, "0.0.0.0", () => log("info", "servidor listo", { puerto: config.puerto, entorno: config.entorno, commit: config.gitSha }));

let apagando = false;
function apagar(senal) {
    if (apagando) return;
    apagando = true;
    log("info", "apagando", { senal });
    // 1. ready empieza a dar 503 para que el balanceador deje de mandar trafico
    app.locals.salud.marcarApagando();
    // 2. se espera lo que esta en curso y se cierra
    servidor.close(() => {
        log("info", "apagado limpio");
        process.exit(0);
    });
    servidor.closeIdleConnections();
    // 3. si tarda mucho, se corta
    setTimeout(() => {
        log("warn", "apagado forzado");
        process.exit(1);
    }, config.tiempoApagadoMs).unref();
}

process.once("SIGTERM", () => apagar("SIGTERM"));
process.once("SIGINT", () => apagar("SIGINT"));
process.on("unhandledRejection", (err) => log("error", "promesa sin catch", { error: String(err) }));
