// Helpers para que TODAS las respuestas tengan la misma forma.
//   exito:  { ok: true,  data, meta? }
//   error:  { ok: false, error: { code, message, details? } }

function ok(res, data, meta, headers = {}) {
  res.set(headers);
  return res.status(200).json({ ok: true, data, ...(meta && { meta }) });
}

function created(res, data, location) {
  return res.status(201).location(location).json({ ok: true, data });
}

// 204 No Content: no lleva cuerpo.
function noContent(res) {
  return res.status(204).end();
}

function fail(res, status, code, message, details) {
  return res.status(status).json({ ok: false, error: { code, message, ...(details && { details }) } });
}

module.exports = { ok, created, noContent, fail };
