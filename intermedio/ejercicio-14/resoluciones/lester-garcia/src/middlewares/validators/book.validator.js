const VALID_GENRES = ["Ficción", "Filosofía", "Realismo Mágico", "Ciencia Ficción", "Poesía", "Historia"];

export const createBookValidator = (req) => {
  const errors = [];
  const { isbn, title, author, genre, pages, publishYear } = req.body;

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!isbn || typeof isbn !== "string" || isbn.trim().length < 10) {
    errors.push({ field: "isbn", message: "El ISBN debe tener al menos 10 caracteres." });
  }

  if (!title || typeof title !== "string" || title.trim().length < 2) {
    errors.push({ field: "title", message: "El título debe contener al menos 2 caracteres." });
  }

  if (!author || typeof author !== "string" || author.trim().length < 2) {
    errors.push({ field: "author", message: "El nombre del autor es obligatorio." });
  }

  if (!genre || !VALID_GENRES.includes(genre.trim())) {
    errors.push({ field: "genre", message: `Género literario no válido. Permitidos: ${VALID_GENRES.join(", ")}.` });
  }

  const p = Number(pages);
  if (pages === undefined || isNaN(p) || p <= 0) {
    errors.push({ field: "pages", message: "El número de páginas debe ser un entero positivo." });
  }

  const year = Number(publishYear);
  if (publishYear === undefined || isNaN(year) || year < 1000 || year > 2026) {
    errors.push({ field: "publishYear", message: "Año de publicación inválido." });
  }

  return errors;
};