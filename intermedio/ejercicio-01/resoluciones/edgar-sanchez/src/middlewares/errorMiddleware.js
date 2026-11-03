export function manejarErrorGlobal(error, peticion, respuesta, siguiente) {
  respuesta.status(400).json({ ok: false, message: error.message || "error inesperado" });
}
