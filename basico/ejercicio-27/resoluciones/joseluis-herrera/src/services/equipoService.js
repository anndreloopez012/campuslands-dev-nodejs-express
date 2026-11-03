const equipos = [
    {
        id: 1,
        nombre: "Dragon Force",
        region: "LATAM",
        jugadores: 5
    },
    {
        id: 2,
        nombre: "Shadow Legends",
        region: "Brasil",
        jugadores: 5
    },
    {
        id: 3,
        nombre: "Titan Gaming",
        region: "Norteamérica",
        jugadores: 5
    }
];

export const obtenerEquipos = () => {
    return equipos;
};

export const obtenerEquipoPorId = (id) => {
    return equipos.find(
        (equipo) => equipo.id === id
    );
};