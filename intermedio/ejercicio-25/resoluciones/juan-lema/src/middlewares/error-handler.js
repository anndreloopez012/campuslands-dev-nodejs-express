import { AppError } from "../errors.js";

const BODY_PARSER_ERRORS = {
  "entity.parse.failed": [400, "INVALID_JSON", "El cuerpo no es un JSON valido"],
  "entity.too.large": [413, "PAYLOAD_TOO_LARGE", "El cuerpo supera el limite de 10 KB"],
};

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const isClientError = err.status >= 400 && err.status < 500;
  const known = err instanceof AppError ? [err.status, err.code, err.message] : (BODY_PARSER_ERRORS[err.type] ?? (isClientError ? [err.status, "BAD_REQUEST", "Peticion invalida"] : null));
  if (known) return res.status(known[0]).json({ ok: false, code: known[1], message: known[2] });

  console.error(err);
  res.status(500).json({ ok: false, code: "INTERNAL_ERROR", message: "Error interno" });
}

export { errorHandler };
