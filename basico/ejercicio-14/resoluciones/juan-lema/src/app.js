import { validateBook } from "./services/book-validator.service.js";

function main() {
  const [title, author, pages, year] = process.argv.slice(2);
  const book = { title, author, pages, year };

  const { valid, errors } = validateBook(book);

  if (!valid) {
    console.error("Libro invalido:");
    errors.forEach((message) => console.error(`- ${message}`));
    process.exitCode = 1;
    return;
  }

  console.log("Libro valido:");
  console.table(book);
}

main();
