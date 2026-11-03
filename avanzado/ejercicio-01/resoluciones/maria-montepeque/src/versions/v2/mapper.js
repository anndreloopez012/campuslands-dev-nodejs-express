// v2 agrupa los stats, agrega el inventario y un link a si mismo
export function aV2(personaje) {
    return {
        id: personaje.id,
        nombre: personaje.nombre,
        clase: personaje.clase,
        nivel: personaje.nivel,
        stats: {
            vida: personaje.vida,
            mana: personaje.mana,
            fuerza: personaje.fuerza
        },
        inventario: [...personaje.inventario],
        links: {
            self: `/api/v2/personajes/${personaje.id}`,
            subirNivel: `/api/v2/personajes/${personaje.id}/subir-nivel`
        }
    };
}
