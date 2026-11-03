import { MODALIDADES, LIMITES } from "../constants.js";
import { esTextoEntre, exigirSinErrores } from "../utils/validar.js";

const MSG_NOMBRE = `nombre debe tener entre ${LIMITES.nombreMin} y ${LIMITES.nombreMax} letras`;
const MSG_MODALIDAD = `modalidad debe ser ${MODALIDADES.join(" o ")}`;

function validarNombre(body, errores) {
    if (!esTextoEntre(body.nombre, LIMITES.nombreMin, LIMITES.nombreMax)) errores.push(MSG_NOMBRE);
}

function validarCiudad(body, errores) {
    if (!esTextoEntre(body.ciudad, LIMITES.ciudadMin)) errores.push("ciudad es obligatoria");
}

export function validarEquipoNuevo(body = {}) {
    const errores = [];
    validarNombre(body, errores);
    if (!MODALIDADES.includes(body.modalidad)) errores.push(MSG_MODALIDAD);
    validarCiudad(body, errores);
    exigirSinErrores(errores);
}

// al editar la modalidad no se puede cambiar
// ojo: la version de antes usaba != undefined, que tambien deja pasar null
// los tests de contrato lo detectaron, por eso reviso los dos
export function validarEquipoEditado(body = {}, modalidadActual) {
    const errores = [];
    validarNombre(body, errores);
    validarCiudad(body, errores);
    const mandoModalidad = body.modalidad !== undefined && body.modalidad !== null;
    if (mandoModalidad && body.modalidad !== modalidadActual) {
        errores.push("la modalidad no se puede cambiar");
    }
    exigirSinErrores(errores);
}

export { MSG_MODALIDAD };
