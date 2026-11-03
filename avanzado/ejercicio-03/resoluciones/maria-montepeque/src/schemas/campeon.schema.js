import { z } from "./zod.js";
import { rol, texto, paginacionQuery } from "./comunes.schema.js";

// etiquetas: en minusculas y sin repetidos
const etiquetas = z
    .array(texto(2, 15).toLowerCase())
    .max(4, { error: "maximo 4 etiquetas" })
    .transform((lista) => [...new Set(lista)]);

// la forma de un campeon, sin defaults
// strictObject: si mandan un campo que no esta aqui (ej. "id" o "admin") da error
// asi nadie puede colar datos que no deberia poder cambiar
const campeonBase = z.strictObject({
    nombre: texto(2, 20),
    rol,
    dificultad: z.number().int().min(1).max(3),
    precio: z.number().int().min(450).max(7800),
    etiquetas
});

// crear: igual que la base pero precio y etiquetas tienen valor por defecto
export const campeonCrear = campeonBase.extend({
    precio: campeonBase.shape.precio.default(4800),
    etiquetas: etiquetas.default([])
});

// editar (PATCH): todos los campos opcionales, pero al menos uno
// .partial() reusa la base, asi las reglas no se escriben dos veces
export const campeonEditar = campeonBase
    .partial()
    .refine((datos) => Object.keys(datos).length > 0, { error: "Manda al menos un campo para cambiar" });

export const campeonesQuery = z.strictObject({
    rol: rol.optional(),
    dificultadMax: z.coerce.number().int().min(1).max(3).optional(),
    q: texto(2, 20).optional(),
    ...paginacionQuery
});
