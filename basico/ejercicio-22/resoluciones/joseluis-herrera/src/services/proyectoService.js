const proyectos = [
    {
        id: 1,
        nombre: "Casa moderna",
        estilo: "Minimalista"
    },
    {
        id: 2,
        nombre: "Edificio futurista",
        estilo: "Futurista"
    }
];

export const obtenerProyectos = () => {
    return proyectos;
};

export const obtenerProyectoPorId = (id) => {
    return proyectos.find((proyecto) => proyecto.id === id);
};

export const crearProyecto = (nombre, estilo) => {
    const nuevoProyecto = {
        id: proyectos.length + 1,
        nombre,
        estilo
    };

    proyectos.push(nuevoProyecto);

    return nuevoProyecto;
};