export const errorHandler = (err, req, res, next) => {
  // Manejo de errores de sintaxis JSON (400 Bad Request)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      status: "fail",
      message: "Formato JSON inválido en el cuerpo de la petición."
    });
  }

  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  return res.status(statusCode).json({
    status,
    message: err.message || "Error interno del servidor en el motor del RPG."
  });
};