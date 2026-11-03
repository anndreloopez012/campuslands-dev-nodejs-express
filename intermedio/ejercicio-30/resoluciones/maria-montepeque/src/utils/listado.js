import AppError from "./app-error.js";

// paginacion y orden reutilizables (ejercicios 09 y 10)

const LIMIT_POR_DEFECTO = 10;
const LIMIT_MAXIMO = 50;

function leerEnteroQuery(texto, nombre, porDefecto) {
    if (texto === undefined) return porDefecto;
    const valor = Number(texto);
    if (!Number.isInteger(valor) || valor < 1) {
        throw new AppError(400, `${nombre} debe ser un entero mayor a 0`);
    }
    return valor;
}

// devuelve la pagina pedida y los datos para que el cliente sepa cuantas hay
export function paginar(items, query) {
    const page = leerEnteroQuery(query.page, "page", 1);
    const limit = leerEnteroQuery(query.limit, "limit", LIMIT_POR_DEFECTO);

    if (limit > LIMIT_MAXIMO) {
        throw new AppError(400, `limit no puede pasar de ${LIMIT_MAXIMO}`);
    }

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const inicio = (page - 1) * limit;

    return {
        data: items.slice(inicio, inicio + limit),
        meta: { page, limit, total, totalPages }
    };
}

// "sort=-anio,marca": anio de mayor a menor y de empate marca A-Z
export function ordenar(items, sort, permitidos) {
    if (!sort) return items;

    const campos = String(sort).split(",").map((c) => c.trim()).filter(Boolean);

    for (const campo of campos) {
        const nombre = campo.replace(/^-/, "");
        if (!permitidos.includes(nombre)) {
            throw new AppError(400, `No se puede ordenar por "${nombre}", usa: ${permitidos.join(", ")}`);
        }
    }

    return [...items].sort((a, b) => {
        for (const campo of campos) {
            const direccion = campo.startsWith("-") ? -1 : 1;
            const nombre = campo.replace(/^-/, "");
            if (a[nombre] < b[nombre]) return -1 * direccion;
            if (a[nombre] > b[nombre]) return 1 * direccion;
        }
        return 0;
    });
}
