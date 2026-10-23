import { readFileSync } from "node:fs";
import { findMissingScripts } from "./services/match.service.js";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url)));
const missing = findMissingScripts(pkg.scripts);

console.table({
    name: pkg.name,
    version: pkg.version,
    scripts: Object.keys(pkg.scripts || {}).join(", "),
});

if (missing.length > 0) {
    console.error(`Faltan scripts requeridos: ${missing.join(", ")}`);
    process.exitCode = 1;
} else {
    console.log("Todos los scripts requeridos estan definidos.");
}