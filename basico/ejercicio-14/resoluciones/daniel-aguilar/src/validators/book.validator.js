const CURRENT_YEAR = new Date().getFullYear();
const ISBN_REGEX = /^(\d{9}[\dX]|\d{13})$/;

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value, min, max) =>
  typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;

/**
 * Valida y limpia el cuerpo de POST /books.
 * Devuelve { value, errors }. Solo `value` contiene campos conocidos (lista blanca);
 * cualquier campo extra enviado por el cliente se descarta.
 */
function validateBook(input) {
  if (!isPlainObject(input)) {
    return { errors: [{ field: 'body', message: 'El cuerpo debe ser un objeto JSON' }] };
  }

  const errors = [];
  const value = {};

  if (isText(input.title, 1, 120)) value.title = input.title.trim();
  else errors.push({ field: 'title', message: 'Obligatorio, texto de 1 a 120 caracteres' });

  if (isText(input.author, 2, 80)) value.author = input.author.trim();
  else errors.push({ field: 'author', message: 'Obligatorio, texto de 2 a 80 caracteres' });

  if (Number.isInteger(input.year) && input.year >= 1000 && input.year <= CURRENT_YEAR) value.year = input.year;
  else errors.push({ field: 'year', message: `Obligatorio, entero entre 1000 y ${CURRENT_YEAR}` });

  if (Number.isInteger(input.pages) && input.pages >= 1 && input.pages <= 5000) value.pages = input.pages;
  else errors.push({ field: 'pages', message: 'Obligatorio, entero entre 1 y 5000' });

  if (input.isbn !== undefined) {
    const isbn = typeof input.isbn === 'string' ? input.isbn.replace(/[-\s]/g, '').toUpperCase() : '';
    if (ISBN_REGEX.test(isbn)) value.isbn = isbn;
    else errors.push({ field: 'isbn', message: 'Opcional; debe tener 10 o 13 digitos (se permiten guiones)' });
  }

  if (input.tags !== undefined) {
    const valid =
      Array.isArray(input.tags) && input.tags.length <= 5 && input.tags.every((tag) => isText(tag, 1, 30));
    if (valid) value.tags = input.tags.map((tag) => tag.trim().toLowerCase());
    else errors.push({ field: 'tags', message: 'Opcional; arreglo de hasta 5 textos de 1 a 30 caracteres' });
  }

  return { value, errors };
}

/** Valida y normaliza los query params de GET /books (todos los valores llegan como texto). */
function validateListQuery(query) {
  const errors = [];
  const value = { page: 1, limit: 10, q: '' };

  if (query.page !== undefined) {
    const page = Number(query.page);
    if (Number.isInteger(page) && page >= 1) value.page = page;
    else errors.push({ field: 'page', message: 'Debe ser un entero mayor o igual a 1' });
  }
  if (query.limit !== undefined) {
    const limit = Number(query.limit);
    if (Number.isInteger(limit) && limit >= 1 && limit <= 50) value.limit = limit;
    else errors.push({ field: 'limit', message: 'Debe ser un entero entre 1 y 50' });
  }
  if (query.q !== undefined) {
    if (typeof query.q === 'string' && query.q.length <= 50) value.q = query.q.trim().toLowerCase();
    else errors.push({ field: 'q', message: 'Debe ser texto de maximo 50 caracteres' });
  }
  return { value, errors };
}

function validateId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = { validateBook, validateListQuery, validateId };
