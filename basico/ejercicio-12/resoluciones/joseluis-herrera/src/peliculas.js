const peliculas = [
    {
        id: 1,
        titulo: "El Conjuro",
        director: "James Wan",
        anio: 2013
    },
    {
        id: 2,
        titulo: "It",
        director: "Andy Muschietti",
        anio: 2017
    },
    {
        id: 3,
        titulo: "La Monja",
        director: "Corin Hardy",
        anio: 2018
    }
];

function obtenerPeliculas() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(peliculas);
        }, 1000);
    });
}

export { obtenerPeliculas };