import { parseArgs, quoteRental } from "./services/rental.service.js";

const flags = parseArgs(process.argv.slice(2));

try {
    console.table(quoteRental(flags));
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
}