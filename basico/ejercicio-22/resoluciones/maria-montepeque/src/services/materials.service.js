import { ValidationError } from "./errors.js";

const PAINT_COVERAGE_M2_PER_L = 10;
const FLOOR_BOX_M2 = 2.5;
const WASTE_FACTOR = 1.1;

const catalog = {
    paint: { unit: "litro", pricePerUnit: 8.5 },
    flooring: { unit: "caja", pricePerUnit: 42 },
};

function estimateMaterials({ wallArea, floorArea }, { coats = 2 } = {}) {
    if (!Number.isInteger(coats) || coats < 1 || coats > 4) {
        throw new ValidationError("coats debe ser un entero entre 1 y 4");
    }

    const paintLiters = Math.ceil((wallArea * coats) / PAINT_COVERAGE_M2_PER_L);
    const flooringBoxes = Math.ceil((floorArea * WASTE_FACTOR) / FLOOR_BOX_M2);

    const items = [
        { material: "paint", quantity: paintLiters, ...catalog.paint, subtotal: paintLiters * catalog.paint.pricePerUnit },
        { material: "flooring", quantity: flooringBoxes, ...catalog.flooring, subtotal: flooringBoxes * catalog.flooring.pricePerUnit },
    ];

    return { coats, items, total: items.reduce((sum, item) => sum + item.subtotal, 0) };
}

export { estimateMaterials, catalog };
