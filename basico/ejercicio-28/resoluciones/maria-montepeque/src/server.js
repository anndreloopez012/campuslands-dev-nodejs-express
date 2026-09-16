import http from "node:http";
import { loadConfig } from "./config/index.js";
import { createApp } from "./app.js";

let config;

try {
    config = loadConfig();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

const { PORT, env, MAP_NAME, LOBBY_SIZE } = config.values;

http.createServer(createApp(config)).listen(PORT, () => {
    console.log(`Battle Royale API [${env}] en http://localhost:${PORT} | mapa: ${MAP_NAME} | lobby: ${LOBBY_SIZE}`);
});
