/**
 * Valida los datos de un libro acumulando TODOS los errores.
 * @param {Object} book - { title, author, pages, year }
 * @returns {{ valid: boolean, errors: string[], book?: Object }}
 */
export function validateBook({ title, author, pages, year }) {
  const errors = [];
  const currentYear = new Date().getFullYear();

  // Validar título
  if (!title || typeof title !== "string" || title.trim() === "") {
    errors.push("El título es obligatorio y debe ser texto no vacío.");
  }

  // Validar autor
  if (!author || typeof author !== "string" || author.trim() === "") {
    errors.push("El autor es obligatorio y debe ser texto no vacío.");
  }

  // Validar páginas
  const parsedPages = Number(pages);
  if (!Number.isInteger(parsedPages) || parsedPages <= 0) {
    errors.push("Las páginas deben ser un número entero positivo.");
  }

  // Validar año
  const parsedYear = Number(year);
  if (
    !Number.isInteger(parsedYear) ||
    parsedYear < 1000 ||
    parsedYear > currentYear
  ) {
    errors.push(
      `El año debe ser un número entero entre 1000 y ${currentYear}.`
    );
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    book: {
      title: title.trim(),
      author: author.trim(),
      pages: parsedPages,
      year: parsedYear,
    },
  };
}
