const { readFile } = require('node:fs/promises');
const path = require('node:path');

async function findMovie(title) {
  const filePath = path.join(__dirname, '..', 'data', 'movies.json');
  const file = await readFile(filePath, 'utf8');
  const movies = JSON.parse(file);
  const movie = movies.find((item) => item.title.toLowerCase() === title.toLowerCase());

  if (!movie) {
    throw new Error(`No se encontro la pelicula ${title}.`);
  }

  return movie;
}

async function main() {
  const title = process.argv.slice(2).join(' ') || 'La casa oscura';
  const movie = await findMovie(title);
  console.log(`${movie.title} - ${movie.year} - ${movie.rating}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});