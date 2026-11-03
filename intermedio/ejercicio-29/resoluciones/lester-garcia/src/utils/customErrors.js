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
    super("Inconsistencias en los datos del club de fútbol o fútbol sala.", 400);
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El club de fútbol o fútbol sala no fue encontrado.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un club registrado con ese nombre en la liga.") {
    super(message, 409);
  }
}
