class DomainError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}

const STATUS_BY_CODE = Object.freeze({
  INVALID_INPUT: 400,
  INVALID_FORMULA: 400,
  UNKNOWN_ELEMENT: 400,
  INVALID_EQUATION: 400,
  NOT_FOUND: 404,
  DUPLICATE_NAME: 409,
});

export { DomainError, STATUS_BY_CODE };
