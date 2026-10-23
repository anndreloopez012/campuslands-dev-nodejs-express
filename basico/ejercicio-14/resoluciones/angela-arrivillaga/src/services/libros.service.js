const libros = [
  { id: 1, titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', paginas: 863, anio: 1605 },
  { id: 2, titulo: 'Cien anos de soledad', autor: 'Gabriel Garcia Marquez', paginas: 471, anio: 1967 }
];

export function getLibros() {
  return libros;
}

export function validarLibro(datos) {
  const errores = [];
  const anioActual = new Date().getFullYear();

  if (typeof datos.titulo !== 'string' || datos.titulo.trim().length < 2) {
    errores.push('El titulo es obligatorio y debe tener al menos 2 caracteres');
  }

  if (typeof datos.autor !== 'string' || datos.autor.trim() === '') {
    errores.push('El autor es obligatorio');
  }

  if (!Number.isInteger(datos.paginas) || datos.paginas <= 0) {
    errores.push('Las paginas deben ser un numero entero mayor a 0');
  }

  if (!Number.isInteger(datos.anio) || datos.anio < 1000 || datos.anio > anioActual) {
    errores.push('El anio debe ser un numero entre 1000 y ' + anioActual);
  }

  return errores;
}

export function agregarLibro(datos) {
  const nuevo = {
    id: libros.length + 1,
    titulo: datos.titulo.trim(),
    autor: datos.autor.trim(),
    paginas: datos.paginas,
    anio: datos.anio
  };

  libros.push(nuevo);
  return nuevo;
}
