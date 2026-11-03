import { findMovie, getScareLevel, getShowtime } from "./services/screening.service.js";

const [titleArg, minutesArg] = process.argv.slice(2);

async function main() {
    console.log("Buscando funcion de terror...");

    try {
        const movie = await findMovie(titleArg || "Hereditary", minutesArg || 127);
        const [scare, showtime] = await Promise.all([getScareLevel(movie), getShowtime(movie)]);

        console.log("Funcion programada:");
        console.table({ ...movie, ...scare, ...showtime });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
    }
}

main();