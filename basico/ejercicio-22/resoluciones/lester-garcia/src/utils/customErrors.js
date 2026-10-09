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
  constructor(message = "Parámetros de entrada o filtrado inválidos.") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El proyecto de visualización 3D solicitado no fue localizado.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un proyecto registrado con ese nombre.") {
    super(message, 409);
  }
}