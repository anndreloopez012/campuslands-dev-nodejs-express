import { requestDocking } from "./services/docking.service.js";
import { AppError } from "./errors/app-error.js";

const [ship, bay, cargo] = process.argv.slice(2);

function handleError(error) {
    if (!(error instanceof AppError)) {
        console.error(`Error inesperado: ${error.message}`);
        return;
    }

    console.error(`[${error.code}] ${error.message}`);

    if (Object.keys(error.details).length > 0) {
        console.table(error.details);
    }

    if (error.cause) {
        console.error(`Causa: ${error.cause.message}`);
    }
}

async function main() {
    console.log("Solicitando permiso de atraque...");

    try {
        const docking = await requestDocking({ ship: ship || "Serenity", bay: bay || "A", cargo: cargo || 50 });
        console.log("Atraque autorizado:");
        console.table(docking);
    } catch (error) {
        handleError(error);
        process.exitCode = 1;
    } finally {
        console.log("Control de estacion: solicitud cerrada.");
    }
}

main();