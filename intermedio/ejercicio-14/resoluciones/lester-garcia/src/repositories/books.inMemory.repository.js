const inMemoryBooks = [
  {
    id: "1",
    isbn: "978-0307474728",
    title: "Cien Años de Soledad",
    author: "Gabriel García Márquez",
    genre: "Realismo Mágico",
    pages: 471,
    publishYear: 1967,
    createdById: "USR-01"
  },
  {
    id: "2",
    isbn: "978-8420674209",
    title: "Ficciones",
    author: "Jorge Luis Borges",
    genre: "Ficción",
    pages: 224,
    publishYear: 1944,
    createdById: "USR-01"
  },
  {
    id: "3",
    isbn: "978-8437604947",
    title: "Primero Sueño",
    author: "Sor Juana Inés de la Cruz",
    genre: "Poesía",
    pages: 120,
    publishYear: 1692,
    createdById: "USR-02"
  }
];

export const findAllBooks = async () => [...inMemoryBooks];

export const findBookById = async (id) => {
  const book = inMemoryBooks.find((b) => b.id === String(id));
  return book ? { ...book } : null;
};

export const findBookByIsbn = async (isbn) => {
  const book = inMemoryBooks.find((b) => b.isbn === isbn.trim());
  return book ? { ...book } : null;
};

export const saveBook = async (bookData) => {
  const newBook = { ...bookData };
  inMemoryBooks.push(newBook);
  return { ...newBook };
};

export const deleteBook = async (id) => {
  const index = inMemoryBooks.findIndex((b) => b.id === String(id));
  if (index === -1) return false;
  inMemoryBooks.splice(index, 1);
  return true;
};