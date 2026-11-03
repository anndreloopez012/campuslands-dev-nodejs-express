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

  const payload = {
    status: error.status,
    requestId: req.id,
    message: error.message
  };

  if (err.errors) payload.validationErrors = err.errors;

  if (process.env.NODE_ENV === "development") {
    payload.stack = error.stack;
  }

  return res.status(error.statusCode).json(payload);
};