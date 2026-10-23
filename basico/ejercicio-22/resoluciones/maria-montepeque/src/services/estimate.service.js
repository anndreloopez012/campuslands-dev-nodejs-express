import { roomGeometry } from "./geometry.service.js";
import { estimateMaterials } from "./materials.service.js";
import { toModelMillimeters } from "./scale.service.js";

function estimateRoom({ name = "Sin nombre", coats, scale = "1:50", ...dimensions }) {
    const geometry = roomGeometry(dimensions);
    const materials = estimateMaterials(geometry, { coats });

    const model = {
        width: toModelMillimeters(dimensions.width, scale).modelMillimeters,
        length: toModelMillimeters(dimensions.length, scale).modelMillimeters,
        height: toModelMillimeters(dimensions.height, scale).modelMillimeters,
    };

    return { name, geometry, materials, model: { scale, unit: "mm", ...model } };
}

export { estimateRoom };
