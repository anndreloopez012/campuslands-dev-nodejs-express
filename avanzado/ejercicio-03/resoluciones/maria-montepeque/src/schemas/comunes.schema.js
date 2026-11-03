import { z } from "./zod.js";

// piezas que se reusan en varios schemas

// los params y la query llegan como texto, z.coerce los convierte a numero
export const idParams = z.strictObject({
    id: z.coerce.number({ error: "El id debe ser un numero" }).int({ error: "El id debe ser entero" }).positive({ error: "El id debe ser positivo" })
});

export const paginacionQuery = {
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50, { error: "limit no puede pasar de 50" }).default(10)
};

export const ROLES = ["top", "jungla", "mid", "adc", "soporte"];
export const rol = z.enum(ROLES, { error: `rol debe ser uno de: ${ROLES.join(", ")}` });

// texto con espacios recortados
export const texto = (min, max) => z.string().trim().min(min).max(max);
