import {
  DomainError,
  SquadNotFoundError,
  SquadFullError,
  InvalidDropZoneError,
} from "../domain/errors.js";

function domainErrorHandler(err, req, res, next) {
  if (err instanceof SquadNotFoundError) {
    res.status(404).json({ ok: false, code: err.code, message: err.message });
    return;
  }
  if (err instanceof SquadFullError) {
    res.status(409).json({ ok: false, code: err.code, message: err.message });
    return;
  }
  if (err instanceof InvalidDropZoneError) {
    res.status(422).json({ ok: false, code: err.code, message: err.message });
    return;
  }
  if (err instanceof DomainError) {
    res.status(400).json({ ok: false, code: err.code, message: err.message });
    return;
  }

  res.status(500).json({ ok: false, code: "INTERNAL_ERROR", message: "Error interno del servidor" });
}

export { domainErrorHandler };
