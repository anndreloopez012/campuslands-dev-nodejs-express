import { ValidationError, assertPositive } from "./errors.js";

function parseScale(scale) {
    const match = String(scale).match(/^1:(\d+)$/);
    if (!match) throw new ValidationError("scale debe tener el formato 1:N, por ejemplo 1:50");
    return Number(match[1]);
}

function toModelMillimeters(meters, scale = "1:50") {
    assertPositive(meters, "meters");
    const factor = parseScale(scale);

    return { meters, scale, modelMillimeters: Math.round((meters * 1000) / factor) };
}

export { parseScale, toModelMillimeters };
