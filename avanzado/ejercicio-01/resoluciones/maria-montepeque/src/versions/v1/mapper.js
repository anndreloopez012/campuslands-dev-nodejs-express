// v1 muestra el personaje plano, con los nombres viejos hp y mp
// asi lo usaban los clientes que ya estaban antes de la v2
export function aV1(personaje) {
    return {
        id: personaje.id,
        nombre: personaje.nombre,
        clase: personaje.clase,
        nivel: personaje.nivel,
        hp: personaje.vida,
        mp: personaje.mana
    };
}
