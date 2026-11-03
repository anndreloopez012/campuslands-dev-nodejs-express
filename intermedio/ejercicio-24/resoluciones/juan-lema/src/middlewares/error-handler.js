import { DomainError, STATUS_BY_CODE } from "../errors.js";

function errorHandler(err, req, res, next) {
  const isDomain = err instanceof DomainError;
  const status = isDomain ? (STATUS_BY_CODE[err.code] ?? 500) : err.status || 500;
  if (status === 500) console.error(err);

  const message = err.type === "entity.parse.failed" ? "El cuerpo no es un JSON valido" : err.message;
  res.status(status).json({ ok: false, ...(isDomain && status !== 500 && { code: err.code }), message: status === 500 ? "Error interno" : message });
}

export { errorHandler };
