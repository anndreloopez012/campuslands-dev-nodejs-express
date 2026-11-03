import { crearLogger } from "./logs/logger.js";
import { crearApp } from "./app.js";

const PORT = process.env.PORT || 4013;
const logger = crearLogger({ nivel: process.env.LOG_LEVEL || "info" });

crearApp({ logger }).listen(PORT, () => {
    logger.info("servidor iniciado", { puerto: Number(PORT), nivelLog: logger.nivel, pid: process.pid });
});

// errores que se escaparon de todo: se loguean antes de que el proceso se caiga
process.on("unhandledRejection", (razon) => logger.error("promesa rechazada sin catch", { error: razon }));
process.on("uncaughtException", (error) => {
    logger.error("excepcion no capturada", { error });
    process.exit(1);
});
