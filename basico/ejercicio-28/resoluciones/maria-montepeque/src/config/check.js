import { loadConfig, redact } from "./index.js";

try {
    const { values, sources } = loadConfig();
    console.log(`Configuracion valida para "${values.env}":`);
    console.table(Object.entries(redact(values)).map(([key, value]) => ({ key, value: Array.isArray(value) ? value.join(",") : value, source: sources[key] })));
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}
