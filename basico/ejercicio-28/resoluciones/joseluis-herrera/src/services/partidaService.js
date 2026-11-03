const partidas = [
    {
        id: 1,
        nombre: "Partida Alfa",
        mapa: "Isla",
        jugadores: 100
    },
    {
        id: 2,
        nombre: "Partida Beta",
        mapa: "Desierto",
        jugadores: 80
    },
    {
        id: 3,
        nombre: "Partida Gamma",
        mapa: "Ciudad",
        jugadores: 60
    }
];

export const obtenerPartidas = () => {
    return partidas;
};

export const obtenerPartidaPorId = (id) => {
    return partidas.find(
        (partida) => partida.id === id
    );
};