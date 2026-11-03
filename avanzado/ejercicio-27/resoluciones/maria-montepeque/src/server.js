import { crearApp } from "./app.js";
import { cargarConfig, configPublica, ErrorConfig } from "./config/cargar.js";

// "fail fast": si la config esta mal, el servidor NI arranca y dice todos los errores juntos
let config;
try {
    config = cargarConfig();
} catch (err) {
    if (err instanceof ErrorConfig) {
        console.error(err.message);
        process.exit(1);
    }
    throw err;
}

if (config.logNivel === "debug") console.log("config:", JSON.stringify(configPublica(config), null, 2));

crearApp(config).listen(config.puerto, () => {
    console.log(`Servidor (${config.entorno}, region ${config.region}) escuchando en ${config.urlBase}`);
});
