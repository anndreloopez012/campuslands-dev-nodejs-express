const pokemon = "pikachu";

async function obtenerPokemon() {
    try {
        const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el Pokémon");
        }

        const datos = await respuesta.json();

        console.log("=== INFORMACIÓN DEL POKÉMON ===");
        console.log("Nombre:", datos.name);
        console.log("ID:", datos.id);
        console.log("Altura:", datos.height);
        console.log("Peso:", datos.weight);
        console.log("\nTipos:");

        datos.types.forEach((tipo) => {
            console.log("-", tipo.type.name);
        });
    } catch (error) {
        console.error("Error:", error.message);
    }
}

obtenerPokemon();