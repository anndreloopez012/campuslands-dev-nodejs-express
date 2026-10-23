import { validateBook } from "./services/book.service.js";

try {
  const book = validateBook(process.argv[2] ?? "Cien años de soledad", process.argv[3] ?? 300);
  console.log(
    JSON.stringify(
      { ok: true, topic: "validacion de entrada", book },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
