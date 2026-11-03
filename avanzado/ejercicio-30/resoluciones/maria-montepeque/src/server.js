import { crearApp } from "./app.js";
import { leerConfig } from "./config.js";

let config;
try {
    config = leerConfig();
} catch (err) {
    console.error(err.message);
    process.exit(1);
}

const servidor = crearApp({ config }).listen(config.puerto, () => {
    console.log(`Taller de motos escuchando en http://localhost:${config.puerto} (${config.entorno})`);
});

// apagado ordenado
for (const senal of ["SIGINT", "SIGTERM"]) {
    process.once(senal, () => {
        console.log(`recibi ${senal}, cerrando...`);
        servidor.close(() => process.exit(0));
        servidor.closeIdleConnections();
        setTimeout(() => process.exit(1), 10_000).unref();
    });
}
