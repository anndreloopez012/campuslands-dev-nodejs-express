import { getMovie } from "./services/movie.service.js";

async function main() {
  try {
    const movie = await getMovie(process.argv[2] ?? "La casa muda");
    console.log(
      JSON.stringify(
        { ok: true, topic: "async await", movie },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
