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
  constructor(message = "Parámetros del partido de futsal inválidos.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Acceso denegado. Se requiere clave de comisionado de liga.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El encuentro de fútbol sala solicitado no existe.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un encuentro registrado con ese código.") {
    super(message, 409);
  }
}