export const errorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      status: "fail",
      message: "Sintaxis JSON inválida en el cuerpo de la petición."
    });
  }

  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  // Ocultar stack trace detallado si estamos en entorno de producción
  const responsePayload = {
    status,
    message: err.message || "Error interno del servidor en el backend de Battle Royale."
  };

  if (process.env.NODE_ENV === "development") {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};