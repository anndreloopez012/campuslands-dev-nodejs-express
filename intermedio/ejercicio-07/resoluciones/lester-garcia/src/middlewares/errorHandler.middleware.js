// Manejo para entorno de desarrollo (máxima visibilidad)
const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
    validationErrors: err.errors || undefined
  });
};

// Manejo para entorno de producción (seguridad y mensajes amigables)
const sendErrorProd = (err, res) => {
  // A) Error operacional conocido: mensaje seguro al cliente
  if (err.isOperational) {
    const payload = {
      status: err.status,
      message: err.message
    };
    if (err.errors) payload.validationErrors = err.errors;
    return res.status(err.statusCode).json(payload);
  }

  // B) Error de programación o bug inesperado (no filtrar detalles internos)
  console.error("[CRITICAL UNEXPECTED ERROR]:", err);
  return res.status(500).json({
    status: "error",
    message: "Ha ocurrido un error inesperado en los servidores del concesionario."
  });
};

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || "error";
  error.isOperational = err.isOperational || false;
  error.stack = err.stack;

  // Interceptar errores de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    error.statusCode = 400;
    error.status = "fail";
    error.isOperational = true;
    error.message = "Formato JSON corrupto o malformado en el cuerpo de la petición.";
  }

  const currentEnv = process.env.NODE_ENV || "development";

  if (currentEnv === "development") {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};