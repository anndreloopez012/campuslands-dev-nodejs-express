const books = [
  { id: 1, title: "Cien Anos de Soledad", author: "Gabriel Garcia Marquez", year: 1967 },
  { id: 2, title: "Rayuela", author: "Julio Cortazar", year: 1963 },
];
let nextId = 3;

const listBooks = () => books;
const getBookById = (id) => books.find((b) => b.id === Number(id)) || null;

function createBook({ title, author, year }) {
  if (!title || typeof title !== "string" || !title.trim()) throw new Error("title es obligatorio");
  if (!author || typeof author !== "string" || !author.trim()) throw new Error("author es obligatorio");

  const numericYear = Number(year);
  if (!Number.isInteger(numericYear) || numericYear < 1) throw new Error("year debe ser un entero valido");

  const book = { id: nextId++, title: title.trim(), author: author.trim(), year: numericYear };
  books.push(book);
  return book;
}

export { listBooks, getBookById, createBook };
