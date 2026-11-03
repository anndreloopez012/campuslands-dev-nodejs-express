const jugadores = [
    {
        id: 1,
        nombre: "Shadow",
        juego: "Valorant",
        rango: "Ascendant"
    },
    {
        id: 2,
        nombre: "Ghost",
        juego: "Counter-Strike 2",
        rango: "Global Elite"
    },
    {
        id: 3,
        nombre: "Viper",
        juego: "Valorant",
        rango: "Immortal"
    }
];

export const obtenerJugadores = () => {
    return jugadores;
};

export const obtenerJugadorPorId = (id) => {
    return jugadores.find(
        (jugador) => jugador.id === id
    );
};

export const crearJugador = (nombre, juego, rango) => {
    const nuevoJugador = {
        id: jugadores.length + 1,
        nombre,
        juego,
        rango
    };

    jugadores.push(nuevoJugador);

    return nuevoJugador;
};

export const eliminarJugador = (id) => {
    const indice = jugadores.findIndex(
        (jugador) => jugador.id === id
    );

    if (indice === -1) {
        return false;
    }

    jugadores.splice(indice, 1);

    return true;
};