export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(errors = []) {
    super("Inconsistencias en los parámetros técnicos de soldadura.", 400);
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Parámetros de soldadura fuera de rango operativo.") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "La inspección de cordón de soldadura no fue encontrada.") {
    super(message, 404);
  }
}
