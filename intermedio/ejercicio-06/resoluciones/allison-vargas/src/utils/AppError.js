export class AppError extends Error {
  constructor(message, statusCode = 500, detalles) {
    super(message);
    this.statusCode = statusCode;
    this.detalles = detalles;
    this.isOperational = true;
  }
}
