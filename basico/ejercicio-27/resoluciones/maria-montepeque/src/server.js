import http from "node:http";
import { handleRequest } from "./app.js";
import { logger, logConfig } from "./core/logger.js";

const PORT = process.env.PORT || 3027;

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    logger.info("servidor iniciado", { port: Number(PORT), ...logConfig, pid: process.pid });
});

process.on("SIGINT", () => {
    logger.warn("apagando servidor por SIGINT");
    server.close(() => process.exit(0));
});
