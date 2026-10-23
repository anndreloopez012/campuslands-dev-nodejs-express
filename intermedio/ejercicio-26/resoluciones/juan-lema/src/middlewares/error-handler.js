import { AppError } from "../errors.js";

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) return res.status(err.status).json({ ok: false, code: err.code, message: err.message });
  if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, code: "INVALID_JSON", message: "El cuerpo no es un JSON valido" });

  console.error(err);
  res.status(500).json({ ok: false, code: "INTERNAL_ERROR", message: "Error interno" });
}

export { errorHandler };
