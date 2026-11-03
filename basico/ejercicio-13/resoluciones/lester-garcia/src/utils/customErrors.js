export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Permite distinguir errores de negocio de fallas no controladas

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado en el sistema estelar") {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Parámetros de telemetría inválidos") {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = "El identificador o registro ya existe en la base de datos") {
    super(message, 409);
  }
}