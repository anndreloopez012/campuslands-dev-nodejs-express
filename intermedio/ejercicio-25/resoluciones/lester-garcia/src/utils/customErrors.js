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
    super("Inconsistencias en los datos de la misión RPG.", 400);
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "La misión o contrato del gremio RPG no fue encontrada.") {
    super(message, 404);
  }
}
