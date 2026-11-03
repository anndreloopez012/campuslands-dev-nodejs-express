const canciones = [
    {
        id: 1,
        titulo: "Blinding Lights",
        artista: "The Weeknd"
    },
    {
        id: 2,
        titulo: "Shape of You",
        artista: "Ed Sheeran"
    },
    {
        id: 3,
        titulo: "Believer",
        artista: "Imagine Dragons"
    }
];

function obtenerCanciones() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(canciones);
        }, 1000);
    });
}

export { obtenerCanciones };