import { validateBook } from "./services/book-validator.service.js";

const args = process.argv.slice(2);

if (args.length < 4) {
  console.log('Uso: node src/app.js "<título>" "<autor>" <páginas> <año>');
  console.log('Ejemplo: node src/app.js "Dune" "Frank Herbert" 412 1965');
  process.exit(0);
}

const [title, author, pages, year] = args;

const result = validateBook({ title, author, pages, year });

if (!result.valid) {
  console.log("\n❌ Errores de validación:\n");
  result.errors.forEach((err, i) => {
    console.log(`  ${i + 1}. ${err}`);
  });
  console.log(`\n  Total: ${result.errors.length} error(es)\n`);
  process.exit(1);
} else {
  console.log("\n📚 ¡Libro válido!");
  console.log(`  Título:  ${result.book.title}`);
  console.log(`  Autor:   ${result.book.author}`);
  console.log(`  Páginas: ${result.book.pages}`);
  console.log(`  Año:     ${result.book.year}\n`);
}
