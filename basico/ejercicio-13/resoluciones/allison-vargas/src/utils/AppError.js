// Error personalizado: cualquier parte del codigo puede lanzar un
// AppError con su propio mensaje y status HTTP. 
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marca "error esperado", no un bug
  }
}
