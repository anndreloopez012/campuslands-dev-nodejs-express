const books = [
  { id: 1, title: 'Fundacion', author: 'Isaac Asimov', year: 1951, pages: 255, tags: ['ciencia ficcion'] },
  { id: 2, title: 'El Principito', author: 'Antoine de Saint-Exupery', year: 1943, pages: 96, tags: ['clasico'] },
  { id: 3, title: 'Cien Anios de Soledad', author: 'Gabriel Garcia Marquez', year: 1967, pages: 471, tags: ['novela'] },
];

function listBooks({ page, limit, q }) {
  const filtered = q
    ? books.filter((book) => `${book.title} ${book.author}`.toLowerCase().includes(q))
    : books;
  const start = (page - 1) * limit;
  return { items: filtered.slice(start, start + limit), total: filtered.length, page, limit };
}

const getBook = (id) => books.find((book) => book.id === id) || null;

function createBook(data) {
  const book = { id: books.reduce((max, item) => Math.max(max, item.id), 0) + 1, ...data };
  books.push(book);
  return book;
}

module.exports = { listBooks, getBook, createBook };
