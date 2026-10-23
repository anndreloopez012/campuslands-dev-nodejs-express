export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "El cuerpo de la petición (JSON) o sus parámetros son inválidos.") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "La obra de arte digital no fue encontrada.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe una obra registrada con ese título.") {
    super(message, 409);
  }
}