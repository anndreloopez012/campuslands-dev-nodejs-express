const books = [
  { id: 1, title: "Cien Años de Soledad", author: "Gabriel García Márquez", year: 1967, pages: 417 },
  { id: 2, title: "1984", author: "George Orwell", year: 1949, pages: 328 }
];

export const getAll = () => books;

export const create = (data) => {
  const newBook = {
    id: books.length + 1,
    title: data.title.trim(),
    author: data.author.trim(),
    year: Number(data.year),
    pages: Number(data.pages)
  };
  books.push(newBook);
  return newBook;
};
