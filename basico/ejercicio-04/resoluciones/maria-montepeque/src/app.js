import calculateStormDamage, { MAX_STORM_LEVEL } from "./services/storm.service.js";

try {
    const playersRemaining = Number(process.argv[2] || 40);
    const stormLevel = Number(process.argv[3] || 3);

    console.log(`Nivel maximo de tormenta: ${MAX_STORM_LEVEL}`);
    console.table(calculateStormDamage(playersRemaining, stormLevel));
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
}