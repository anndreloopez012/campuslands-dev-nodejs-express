import AppError from "../utils/app-error.js";

// precio por metro en quetzales segun proceso y material
// null = esa combinacion no se hace en el taller
const PRECIOS = {
    MIG: { acero: 60, aluminio: 90, inoxidable: 110 },
    TIG: { acero: 80, aluminio: 120, inoxidable: 150 },
    electrodo: { acero: 45, aluminio: null, inoxidable: 95 }
};

const COSTO_MINIMO = 150;

// funcion pura: misma entrada, misma salida, facil de testear
function cotizar({ proceso, material, metros }) {
    const errors = [];

    if (!Object.hasOwn(PRECIOS, proceso)) {
        errors.push(`proceso debe ser uno de: ${Object.keys(PRECIOS).join(", ")}`);
    } else if (!Object.hasOwn(PRECIOS[proceso], material)) {
        errors.push("material debe ser acero, aluminio o inoxidable");
    }
    if (typeof metros !== "number" || !Number.isFinite(metros) || metros <= 0 || metros > 500) {
        errors.push("metros debe ser un numero mayor a 0 y hasta 500");
    }

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }

    const precioMetro = PRECIOS[proceso][material];
    if (precioMetro === null) {
        throw new AppError(422, `El aluminio no se puede soldar con ${proceso}, usa MIG o TIG`);
    }

    // el minimo cubre preparar la maquina aunque sea poquito
    const subtotal = precioMetro * metros;
    const costo = Math.max(COSTO_MINIMO, Math.round(subtotal * 100) / 100);

    return { proceso, material, metros, precioMetro, costo, seAplicoMinimo: subtotal < COSTO_MINIMO };
}

export { cotizar, PRECIOS, COSTO_MINIMO };
