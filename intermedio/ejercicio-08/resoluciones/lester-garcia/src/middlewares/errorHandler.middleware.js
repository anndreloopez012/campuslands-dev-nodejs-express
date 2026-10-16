const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    requestId: req.id,
    message: err.message,
    error: err,
    stack: err.stack,
    validationErrors: err.errors || undefined
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    const payload = {
      status: err.status,
      requestId: req.id,
      message: err.message
    };
    if (err.errors) payload.validationErrors = err.errors;
    return res.status(err.statusCode).json(payload);
  }

  console.error(`[CRITICAL ERROR] [ReqID: ${req.id}]:`, err);
  return res.status(500).json({
    status: "error",
    requestId: req.id,
    message: "Error interno no controlado en la telemetría de hiperautos."
  });
};

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || "error";
  error.isOperational = err.isOperational || false;
  error.stack = err.stack;

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    error.statusCode = 400;
    error.status = "fail";
    error.isOperational = true;
    error.message = "Formato JSON corrupto en el cuerpo de la petición.";
  }

  const currentEnv = process.env.NODE_ENV || "development";

  if (currentEnv === "development") {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};