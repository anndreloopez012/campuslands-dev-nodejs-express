import { readSpec } from "./services/specs.service.js";

try {
    console.log("Ficha tecnica:");
    console.table(readSpec(process.argv[2] || "cbr250"));
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
}