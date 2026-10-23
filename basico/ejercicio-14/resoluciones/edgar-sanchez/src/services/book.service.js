function validateBook(title, pages) {
  if (typeof title !== "string" || !title.trim()) {
    throw new Error("El titulo del libro es obligatorio");
  }

  const pageCount = Number(pages);
  if (!Number.isInteger(pageCount) || pageCount < 1 || pageCount > 5000) {
    throw new Error("Las paginas deben ser un entero entre 1 y 5000");
  }

  return {
    title: title.trim(),
    pages: pageCount,
    available: true,
  };
}

export { validateBook };
