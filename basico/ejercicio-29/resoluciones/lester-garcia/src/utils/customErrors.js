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
  constructor(message = "Se requiere clave de autorización de la liga.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El encuentro o equipo de futsal no fue encontrado.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un partido registrado con ese código de encuentro.") {
    super(message, 409);
  }
}