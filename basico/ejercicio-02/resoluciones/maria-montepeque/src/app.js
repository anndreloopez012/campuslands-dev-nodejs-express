import { calculateMatchStats } from "./services/match.service.js";

try {
    console.table(calculateMatchStats(process.argv[2] || 10, process.argv[3] || 4));
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
}
