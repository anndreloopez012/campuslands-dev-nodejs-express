// peliculas y sus resenas en memoria
// cada resena guarda el id de su pelicula en peliculaId
const peliculas = [
    { id: 1, titulo: "El conjuro", anio: 2013, director: "James Wan" },
    { id: 2, titulo: "Hereditary", anio: 2018, director: "Ari Aster" },
    { id: 3, titulo: "It", anio: 2017, director: "Andy Muschietti" }
];

const resenas = [
    { id: 1, peliculaId: 1, autor: "Sofia", puntuacion: 5, comentario: "No pude dormir esa noche" },
    { id: 2, peliculaId: 1, autor: "Carlos", puntuacion: 4, comentario: "Muy buenos sustos" },
    { id: 3, peliculaId: 2, autor: "Ana", puntuacion: 5, comentario: "Perturbadora de principio a fin" }
];

export { peliculas, resenas };
