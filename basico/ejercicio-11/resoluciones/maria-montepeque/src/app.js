import { queueTrack, estimateWait } from "./services/queue.service.js";

const [trackArg, positionArg] = process.argv.slice(2);

console.log("Agregando a la cola...");

queueTrack(trackArg || "Imagine", positionArg || 3)
    .then((queued) => estimateWait(queued))
    .then((result) => {
        console.log("En cola:");
        console.table(result);
    })
    .catch((error) => {
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
    });