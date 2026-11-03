import { modelos, renders } from "../data/db.js";
import AppError from "../utils/app-error.js";

let nextId = 1;

// minutos aproximados por cada 10 mil poligonos segun calidad
const MINUTOS_POR_CALIDAD = { baja: 1, media: 3, alta: 8 };

function findModelos() {
    return modelos;
}

function findRenders() {
    return renders;
}

function crearRender(body) {
    const { modeloId, calidad } = body || {};
    const errors = [];

    if (!Number.isInteger(modeloId)) errors.push("modeloId debe ser un numero entero");
    if (!MINUTOS_POR_CALIDAD[calidad]) errors.push("calidad debe ser baja, media o alta");

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }

    const modelo = modelos.find((m) => m.id === modeloId);
    if (!modelo) {
        throw new AppError(404, `No existe el modelo con id ${modeloId}`);
    }

    // es simulado, solo calculo cuanto tardaria
    const minutos = Math.ceil(modelo.poligonos / 10000) * MINUTOS_POR_CALIDAD[calidad];

    const render = {
        id: nextId++,
        modeloId,
        modelo: modelo.nombre,
        calidad,
        estado: "en cola",
        minutosEstimados: minutos,
        creado: new Date().toISOString()
    };

    renders.push(render);
    return render;
}

export { findModelos, findRenders, crearRender };
