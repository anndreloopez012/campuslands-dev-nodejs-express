const motos = [
    {
        id: 1,
        marca: "Yamaha",
        modelo: "MT-07",
        cilindrada: 689,
        estado: "Disponible"
    },
    {
        id: 2,
        marca: "Honda",
        modelo: "CBR600RR",
        cilindrada: 599,
        estado: "En mantenimiento"
    },
    {
        id: 3,
        marca: "Kawasaki",
        modelo: "Ninja 400",
        cilindrada: 399,
        estado: "Disponible"
    }
];

export const obtenerMotos = () => {
    return motos;
};

export const obtenerMotoPorId = (id) => {
    return motos.find(
        (moto) => moto.id === id
    );
};

export const crearMoto = (
    marca,
    modelo,
    cilindrada,
    estado
) => {
    const nuevaMoto = {
        id: motos.length + 1,
        marca,
        modelo,
        cilindrada,
        estado
    };

    motos.push(nuevaMoto);

    return nuevaMoto;
};

export const actualizarMoto = (
    id,
    marca,
    modelo,
    cilindrada,
    estado
) => {
    const moto = motos.find(
        (moto) => moto.id === id
    );

    if (!moto) {
        return null;
    }

    moto.marca = marca;
    moto.modelo = modelo;
    moto.cilindrada = cilindrada;
    moto.estado = estado;

    return moto;
};

export const eliminarMoto = (id) => {
    const indice = motos.findIndex(
        (moto) => moto.id === id
    );

    if (indice === -1) {
        return null;
    }

    const motoEliminada = motos.splice(indice, 1);

    return motoEliminada[0];
};