export const errorHandler = (err, req, res, next) => {
  // Captura específica para errores de sintaxis JSON generados por express.json()
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      status: "fail",
      message: "El cuerpo de la petición contiene una sintaxis JSON inválida. Revisa comillas o comas finales."
    });
  }

  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  return res.status(statusCode).json({
    status,
    message: err.message || "Error interno del servidor en la plataforma de arte digital."
  });
};