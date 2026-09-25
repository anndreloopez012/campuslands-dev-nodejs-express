const books = [
    {
      id: 1,
      titulo: "El Principito",
      autor: "Antoine de Saint-Exupery",
      anio: 1943,
      genero: "Ficcion",
      paginas: 96
    },
    {
      id: 2,
      titulo: "Cien Anos de Soledad",
      autor: "Gabriel Garcia Marquez",
      anio: 1967,
      genero: "Realismo magico",
      paginas: 417
    },
    {
      id: 3,
      titulo: "1984",
      autor: "George Orwell",
      anio: 1949,
      genero: "Distopia",
      paginas: 328
    },
    {
      id: 4,
      titulo: "Harry Potter y la piedra filosofal",
      autor: "J. K. Rowling",
      anio: 1997,
      genero: "Fantasia",
      paginas: 309
    }
  ];
  
  function getAllBooks() {
    return books;
  }
  
  function createBook(bookData) {
    const newId =
      books.length > 0
        ? Math.max(...books.map((book) => book.id)) + 1
        : 1;
  
    const newBook = {
      id: newId,
      ...bookData
    };
  
    books.push(newBook);
  
    return newBook;
  }
  
  module.exports = {
    getAllBooks,
    createBook
  };