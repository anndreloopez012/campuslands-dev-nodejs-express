import { LIMITES } from "../constants.js";
import { esEnteroEntre, exigirSinErrores } from "../utils/validar.js";

export function validarPartidoNuevo(body = {}) {
    const errores = [];
    const golesMax = LIMITES.golesMax;

    if (!Number.isInteger(body.localId)) errores.push("localId debe ser un numero entero");
    if (!Number.isInteger(body.visitanteId)) errores.push("visitanteId debe ser un numero entero");
    if (!esEnteroEntre(body.golesLocal, 0, golesMax)) errores.push(`golesLocal debe ser un entero de 0 a ${golesMax}`);
    if (!esEnteroEntre(body.golesVisitante, 0, golesMax)) errores.push(`golesVisitante debe ser un entero de 0 a ${golesMax}`);

    exigirSinErrores(errores);
}
