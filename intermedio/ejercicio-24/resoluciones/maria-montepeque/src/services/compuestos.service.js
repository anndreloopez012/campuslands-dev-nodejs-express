import AppError from "../utils/app-error.js";
import { parsearFormula } from "../utils/formula.js";

// el service recibe sus dependencias en vez de importarlas
// asi en los tests le paso un repo falso, otra tabla o un reloj fijo
function crearCompuestosService({ repo, tablaPeriodica, reloj = () => new Date() }) {
    function masaMolar(formula) {
        const elementos = parsearFormula(formula);

        const desconocidos = Object.keys(elementos).filter((e) => !Object.hasOwn(tablaPeriodica, e));
        if (desconocidos.length > 0) {
            throw new AppError(422, `No tengo la masa de: ${desconocidos.join(", ")}`);
        }

        let total = 0;
        const detalle = Object.entries(elementos).map(([elemento, cantidad]) => {
            const aporte = tablaPeriodica[elemento] * cantidad;
            total += aporte;
            return { elemento, cantidad, masaAtomica: tablaPeriodica[elemento], aporte: redondear(aporte) };
        });

        return { formula: formula.trim(), masaMolar: redondear(total), unidad: "g/mol", detalle };
    }

    async function registrar(body) {
        const { nombre, formula } = body || {};

        if (typeof nombre !== "string" || nombre.trim() === "") {
            throw new AppError(400, "nombre es obligatorio");
        }

        // si la formula esta mal, masaMolar ya tira el error
        const calculo = masaMolar(formula);

        const existente = await repo.buscarPorFormula(calculo.formula);
        if (existente) {
            throw new AppError(409, `${calculo.formula} ya esta registrado como ${existente.nombre}`);
        }

        return repo.guardar({
            nombre: nombre.trim(),
            formula: calculo.formula,
            masaMolar: calculo.masaMolar,
            registrado: reloj().toISOString()
        });
    }

    async function listar() {
        return repo.listar();
    }

    return { masaMolar, registrar, listar };
}

function redondear(numero) {
    return Math.round(numero * 1000) / 1000;
}

export { crearCompuestosService };
