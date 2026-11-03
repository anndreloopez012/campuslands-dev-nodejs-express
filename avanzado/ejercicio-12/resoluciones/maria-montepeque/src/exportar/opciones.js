// campos que se pueden exportar (lista blanca)
export const CAMPOS_PUBLICOS = ["id", "titulo", "subgenero", "anio", "director", "estreno", "etiquetas", "taquillaUsd", "calificacion"];
export const SUBGENEROS = ["sobrenatural", "psicologico", "folk", "ciencia ficcion", "slasher"];

class ErrorOpcion extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.status = 400;
    }
}

// lee y valida la query de la exportacion
export function leerOpciones(query) {
    let campos = CAMPOS_PUBLICOS;
    if (query.campos !== undefined) {
        campos = String(query.campos).split(",").map((c) => c.trim()).filter(Boolean);
        const raros = campos.filter((c) => !CAMPOS_PUBLICOS.includes(c));
        if (raros.length > 0 || campos.length === 0) {
            throw new ErrorOpcion(`campos no permitidos: ${raros.join(", ") || "(vacio)"}. Se puede: ${CAMPOS_PUBLICOS.join(", ")}`);
        }
        // siempre va el id para poder identificar cada pelicula
        if (!campos.includes("id")) campos = ["id", ...campos];
    }

    const subgenero = query.subgenero;
    if (subgenero !== undefined && !SUBGENEROS.includes(subgenero)) {
        throw new ErrorOpcion(`subgenero debe ser uno de: ${SUBGENEROS.join(", ")}`);
    }

    let desde;
    if (query.desde !== undefined) {
        desde = Number(query.desde);
        if (!Number.isInteger(desde)) throw new ErrorOpcion("desde debe ser un anio");
    }

    return { campos, subgenero, desde };
}

export function filtrar(peliculas, { subgenero, desde }) {
    return peliculas.filter((p) => (!subgenero || p.subgenero === subgenero) && (desde === undefined || p.anio >= desde));
}
