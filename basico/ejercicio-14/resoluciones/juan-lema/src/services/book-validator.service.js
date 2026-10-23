const CURRENT_YEAR = new Date().getFullYear();

function validateBook({ title, author, pages, year }) {
  const errors = [];

  if (!title || typeof title !== "string" || !title.trim()) {
    errors.push("title es obligatorio");
  }

  if (!author || typeof author !== "string" || !author.trim()) {
    errors.push("author es obligatorio");
  }

  const numericPages = Number(pages);
  if (!pages || !Number.isInteger(numericPages) || numericPages <= 0) {
    errors.push("pages debe ser un entero mayor a 0");
  }

  const numericYear = Number(year);
  if (!year || !Number.isInteger(numericYear) || numericYear < 1450 || numericYear > CURRENT_YEAR) {
    errors.push(`year debe ser un entero entre 1450 y ${CURRENT_YEAR}`);
  }

  return { valid: errors.length === 0, errors };
}

export { validateBook };
