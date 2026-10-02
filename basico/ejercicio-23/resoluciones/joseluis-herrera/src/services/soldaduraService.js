const trabajos = [
    {
        id: 1,
        cliente: "Carlos",
        tipo: "Soldadura MIG",
        material: "Acero"
    },
    {
        id: 2,
        cliente: "Andrea",
        tipo: "Soldadura TIG",
        material: "Aluminio"
    }
];

export const obtenerTrabajos = () => {
    return trabajos;
};

export const obtenerTrabajoPorId = (id) => {
    return trabajos.find((trabajo) => trabajo.id === id);
};

export const crearTrabajo = (cliente, tipo, material) => {
    const nuevoTrabajo = {
        id: trabajos.length + 1,
        cliente,
        tipo,
        material
    };

    trabajos.push(nuevoTrabajo);

    return nuevoTrabajo;
};