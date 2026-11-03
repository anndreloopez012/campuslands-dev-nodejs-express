const videojuegos = [
    {
        id: 1,
        nombre: "Elden Ring",
        genero: "RPG",
        plataforma: "PC"
    },
    {
        id: 2,
        nombre: "The Witcher 3",
        genero: "RPG",
        plataforma: "PC"
    },
    {
        id: 3,
        nombre: "Final Fantasy VII",
        genero: "RPG",
        plataforma: "PlayStation"
    }
];

export const obtenerVideojuegos = () => {
    return videojuegos;
};

export const obtenerVideojuegoPorId = (id) => {
    return videojuegos.find(
        (videojuego) => videojuego.id === id
    );
};

export const crearVideojuego = (nombre, genero, plataforma) => {
    const nuevoVideojuego = {
        id: videojuegos.length + 1,
        nombre,
        genero,
        plataforma
    };

    videojuegos.push(nuevoVideojuego);

    return nuevoVideojuego;
};