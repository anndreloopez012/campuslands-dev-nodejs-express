const libros = [
    {
        id: 1,
        titulo: "Cien años de soledad",
        autor: "Gabriel García Márquez",
        anio: 1967
    }
];

function agregarLibro(libro) {
    libro.id = libros.length + 1;

    libros.push(libro);

    return libro;
}

export { libros, agregarLibro };