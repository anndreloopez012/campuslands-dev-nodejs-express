const personajes = [
    {
        id: 1,
        nombre: "Ellen Ripley",
        especie: "Humana",
        planeta: "Tierra"
    },
    {
        id: 2,
        nombre: "Spock",
        especie: "Vulcano",
        planeta: "Vulcano"
    },
    {
        id: 3,
        nombre: "T-800",
        especie: "Androide",
        planeta: "Tierra"
    }
];

function buscarPersonaje(id) {
    const personaje = personajes.find((personaje) => personaje.id === id);

    if (!personaje) {
        throw new Error("Personaje no encontrado");
    }

    return personaje;
}

export { personajes, buscarPersonaje };