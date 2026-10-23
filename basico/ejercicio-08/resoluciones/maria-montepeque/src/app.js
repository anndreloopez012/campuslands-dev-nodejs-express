import { loadRaceConfig } from "./services/env.service.js";

try {
    console.table(loadRaceConfig());
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
}