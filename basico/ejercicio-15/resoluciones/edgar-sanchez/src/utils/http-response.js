export function sendJson(response, statusCode, payload, headers = {}) {
  if (response.writableEnded) {
    return;
  }

  const body = JSON.stringify(payload);

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    ...headers
  });
  response.end(body);
}

export function sendNotFound(response, pathname) {
  sendJson(response, 404, {
    ok: false,
    message: "Ruta no encontrada",
    path: pathname
  });
}

export function sendMethodNotAllowed(response, allowedMethods) {
  sendJson(
    response,
    405,
    {
      ok: false,
      message: "Método no permitido",
      allowed: allowedMethods
    },
    { Allow: allowedMethods.join(", ") }
  );
}

export function sendInternalError(response, error) {
  console.error(error);

  sendJson(response, 500, {
    ok: false,
    message: "No se pudo completar la solicitud"
  });
}