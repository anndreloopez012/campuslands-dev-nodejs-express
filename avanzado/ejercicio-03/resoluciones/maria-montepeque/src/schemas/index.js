import { z } from "./zod.js";
import { campeonCrear, campeonEditar, campeonesQuery } from "./campeon.schema.js";
import { partidaCrear } from "./partida.schema.js";

// los schemas que se pueden ver como JSON Schema en /api/schemas/:nombre
export const SCHEMAS_PUBLICOS = {
    "campeon-crear": campeonCrear,
    "campeon-editar": campeonEditar,
    "partida-crear": partidaCrear,
    "campeones-query": campeonesQuery
};

// zod convierte el schema a JSON Schema, que entienden otras herramientas (OpenAPI, Postman...)
// io "input" describe lo que tiene que mandar el cliente (antes de defaults y transform)
export function comoJsonSchema(nombre) {
    const schema = SCHEMAS_PUBLICOS[nombre];
    if (!schema) return null;
    return z.toJSONSchema(schema, { io: "input", unrepresentable: "any" });
}
