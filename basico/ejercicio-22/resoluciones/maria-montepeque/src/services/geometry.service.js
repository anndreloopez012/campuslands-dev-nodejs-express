import { ValidationError, assertPositive } from "./errors.js";

const round = (value) => Math.round(value * 100) / 100;

function openingArea(openings) {
    if (!Array.isArray(openings)) throw new ValidationError("openings debe ser un arreglo");

    return openings.reduce((total, opening, i) => {
        assertPositive(opening?.width, `openings[${i}].width`);
        assertPositive(opening?.height, `openings[${i}].height`);
        return total + opening.width * opening.height;
    }, 0);
}

function roomGeometry({ width, length, height, openings = [] }) {
    assertPositive(width, "width");
    assertPositive(length, "length");
    assertPositive(height, "height");

    const perimeter = 2 * (width + length);
    const grossWallArea = perimeter * height;
    const openingsArea = openingArea(openings);

    if (openingsArea >= grossWallArea) {
        throw new ValidationError("Las aberturas no pueden superar el area de las paredes");
    }

    return {
        floorArea: round(width * length),
        perimeter: round(perimeter),
        wallArea: round(grossWallArea - openingsArea),
        volume: round(width * length * height),
    };
}

export { roomGeometry };
