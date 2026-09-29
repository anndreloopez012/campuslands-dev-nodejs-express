import { playMatch } from "./services/match.service.js";

const [playerArg, skillArg] = process.argv.slice(2);

console.log("Sirviendo...");

playMatch(
    playerArg || "Ana",
    skillArg || 9,
    (result) => {
        console.log("Punto terminado:");
        console.table(result);
    },
    (error) => {
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
    }
);

console.log("Esta linea se imprime antes del resultado (funcion asincrona no bloqueante)");