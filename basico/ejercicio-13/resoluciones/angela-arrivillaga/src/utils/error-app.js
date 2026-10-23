export class ErrorApp extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.status = status;
  }
}
