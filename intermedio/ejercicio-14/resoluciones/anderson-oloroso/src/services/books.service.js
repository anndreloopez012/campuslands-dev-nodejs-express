let library = [
  { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', paginas: 471, seccion: 'Literatura Clásica' },
  { id: 2, titulo: 'El Aleph', autor: 'Jorge Luis Borges', paginas: 146, seccion: 'Ficción' }
];

export const getBooks = () => library;

export const addBook = ({ titulo, autor, paginas, seccion }) => {
  const newBook = { id: library.length + 1, titulo, autor, paginas: Number(paginas) || 200, seccion: seccion || 'General' };
  library.push(newBook);
  return newBook;
};
