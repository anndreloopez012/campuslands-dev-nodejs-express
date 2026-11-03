// biblioteca: prestar y devolver libros
// ademas de hacer el trabajo, actualiza las metricas del negocio

const LIBROS = [
    { id: 1, titulo: "Cien anos de soledad", autor: "Gabriel Garcia Marquez", genero: "novela", copias: 3 },
    { id: 2, titulo: "El Senor Presidente", autor: "Miguel Angel Asturias", genero: "novela", copias: 2 },
    { id: 3, titulo: "Ficciones", autor: "Jorge Luis Borges", genero: "cuento", copias: 1 },
    { id: 4, titulo: "Rayuela", autor: "Julio Cortazar", genero: "novela", copias: 2 },
    { id: 5, titulo: "Veinte poemas de amor", autor: "Pablo Neruda", genero: "poesia", copias: 1 }
];

class ErrorBiblioteca extends Error {
    constructor(status, mensaje) {
        super(mensaje);
        this.status = status;
    }
}

export function crearBiblioteca({ prestamosTotal, devolucionesTotal, rechazosTotal, prestamosActivos }) {
    const libros = LIBROS.map((l) => ({ ...l, prestados: 0 }));

    const buscar = (id) => {
        const libro = libros.find((l) => l.id === id);
        if (!libro) throw new ErrorBiblioteca(404, `No existe el libro ${id}`);
        return libro;
    };

    const ver = (l) => ({ id: l.id, titulo: l.titulo, autor: l.autor, genero: l.genero, copias: l.copias, disponibles: l.copias - l.prestados });

    function prestar(id) {
        const libro = buscar(id);
        if (libro.prestados >= libro.copias) {
            rechazosTotal.inc({ motivo: "sin_copias" });
            throw new ErrorBiblioteca(409, `No quedan copias de "${libro.titulo}"`);
        }
        libro.prestados++;
        prestamosTotal.inc({ genero: libro.genero });
        prestamosActivos.inc();
        return ver(libro);
    }

    function devolver(id) {
        const libro = buscar(id);
        if (libro.prestados === 0) {
            rechazosTotal.inc({ motivo: "no_prestado" });
            throw new ErrorBiblioteca(409, `"${libro.titulo}" no tiene copias prestadas`);
        }
        libro.prestados--;
        devolucionesTotal.inc({ genero: libro.genero });
        prestamosActivos.dec();
        return ver(libro);
    }

    return {
        listar: () => libros.map(ver),
        ver: (id) => ver(buscar(id)),
        prestar,
        devolver,
        // para el medidor de disponibles por genero (se calcula al leer)
        disponiblesPorGenero() {
            const porGenero = {};
            for (const l of libros) porGenero[l.genero] = (porGenero[l.genero] ?? 0) + (l.copias - l.prestados);
            return Object.entries(porGenero).map(([genero, valor]) => ({ etiquetas: { genero }, valor }));
        }
    };
}
