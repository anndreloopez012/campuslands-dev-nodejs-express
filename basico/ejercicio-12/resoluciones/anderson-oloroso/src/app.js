import { fetchMovie, fetchRating } from "./services/movies.service.js";

const title = process.argv[2] || "Exorcista";

async function main() {
  try {
    console.log(`\n🎬 Buscando película: "${title}"...\n`);

    const movie = await fetchMovie(title);
    console.log("🎥 Película encontrada:");
    console.log(`  Título:   ${movie.title}`);
    console.log(`  Año:      ${movie.year}`);
    console.log(`  Director: ${movie.director}`);

    console.log("\n⏳ Obteniendo calificación...\n");

    const rating = await fetchRating(movie.id);
    console.log("⭐ Calificación:");
    console.log(`  Score:    ${rating.score}/10`);
    console.log(`  Reviews:  ${rating.reviews}\n`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

main();
