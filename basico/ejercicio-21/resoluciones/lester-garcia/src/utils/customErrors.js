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
  constructor(message = "Los parámetros enviados en la petición son inválidos.") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El proyecto de renderizado 3D solicitado no fue encontrado.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un proyecto de animación 3D registrado con ese título.") {
    super(message, 409);
  }
}