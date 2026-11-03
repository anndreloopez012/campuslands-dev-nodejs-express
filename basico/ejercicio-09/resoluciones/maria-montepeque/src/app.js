import { listFighters, recordResult } from "./services/fighters.service.js";

const [name, result] = process.argv.slice(2);

try {
    if (name) {
        const updated = recordResult(name, result);
        console.log("Resultado registrado:");
        console.table(updated);
    }

    console.log("Peleadores registrados:");
    console.table(listFighters());
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
}