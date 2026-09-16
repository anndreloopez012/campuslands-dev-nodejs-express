import http from "node:http";
import { loadConfig } from "./config/index.js";
import { createLogger } from "./core/logger.js";
import { createStore } from "./core/store.js";
import { createApp } from "./app.js";

const SEED_FILE = new URL("../data/seed.json", import.meta.url);

let config;
try {
    config = loadConfig();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

const logger = createLogger({ level: config.LOG_LEVEL, format: config.LOG_FORMAT });
const store = await createStore({ file: config.DATA_FILE, seedFile: SEED_FILE, logger });

const server = http.createServer(createApp({ config, store, logger }));

server.listen(config.PORT, () => {
    logger.info("Taller Moto API iniciada", { env: config.env, port: config.PORT, dataFile: config.DATA_FILE });
});

process.on("SIGINT", () => {
    logger.warn("apagando por SIGINT");
    server.close(() => process.exit(0));
});
