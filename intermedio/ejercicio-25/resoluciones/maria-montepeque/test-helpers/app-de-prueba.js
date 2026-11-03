import { crearApp } from "../src/app.js";

export const TOKEN_GM = "token-de-prueba";

// datos chiquitos y conocidos para los tests
export const PERSONAJES_DE_PRUEBA = [
    { id: 1, nombre: "Aldric", clase: "guerrero", nivel: 12, vida: 240, inventario: ["espada"] },
    { id: 2, nombre: "Lyra", clase: "mago", nivel: 50, vida: 500, inventario: ["a", "b", "c", "d", "e"] }
];

// cada test llama esto y tiene una app nueva, sin datos de otros tests
export function appDePrueba() {
    return crearApp({ personajes: PERSONAJES_DE_PRUEBA, tokenGm: TOKEN_GM });
}
