const books = [];

const createBook = ({ title, author, year }) => {
  if (typeof title !== 'string' || title.trim() === '') {
    const error = new Error('El titulo es obligatorio');
    error.statusCode = 400;

    throw error;
  }

  if (typeof author !== 'string' || author.trim() === '') {
    const error = new Error('El autor es obligatorio');
    error.statusCode = 400;

    throw error;
  }

  if (!Number.isInteger(year) || year <= 0) {
    const error = new Error('El año debe ser un numero entero positivo');
    error.statusCode = 400;

    throw error;
  }

  const book = {
    id: books.length + 1,
    title: title.trim(),
    author: author.trim(),
    year
  };

  books.push(book);

  return book;
};

module.exports = {
  createBook
};