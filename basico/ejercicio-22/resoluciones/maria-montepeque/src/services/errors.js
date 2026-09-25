class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
        this.status = 400;
    }
}

function assertPositive(value, field) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        throw new ValidationError(`${field} debe ser un numero mayor a 0`);
    }
}

export { ValidationError, assertPositive };
