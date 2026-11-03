const BLEND_MODES = ["normal", "multiply", "screen", "overlay"];
const MAX_SIDE = 8000;

const canvases = [];
let nextCanvasId = 1;

function validateCanvas({ title, width, height, background }) {
    const errors = [];

    if (typeof title !== "string" || !title.trim()) errors.push("title es obligatorio");
    if (!Number.isInteger(width) || width < 1 || width > MAX_SIDE) errors.push(`width debe ser un entero entre 1 y ${MAX_SIDE}`);
    if (!Number.isInteger(height) || height < 1 || height > MAX_SIDE) errors.push(`height debe ser un entero entre 1 y ${MAX_SIDE}`);
    if (background !== undefined && !/^#[0-9a-f]{6}$/i.test(background)) errors.push("background debe ser un color hex #rrggbb");

    return errors;
}

function validateLayer({ name, opacity, blendMode }) {
    const errors = [];

    if (typeof name !== "string" || !name.trim()) errors.push("name es obligatorio");
    if (typeof opacity !== "number" || opacity < 0 || opacity > 1) errors.push("opacity debe ser un numero entre 0 y 1");
    if (blendMode !== undefined && !BLEND_MODES.includes(blendMode)) errors.push(`blendMode debe ser uno de: ${BLEND_MODES.join(", ")}`);

    return errors;
}

function listCanvases() {
    return canvases;
}

function createCanvas(payload) {
    const errors = validateCanvas(payload);
    if (errors.length > 0) return { errors };

    const canvas = {
        id: nextCanvasId++,
        title: payload.title.trim(),
        width: payload.width,
        height: payload.height,
        background: payload.background ?? "#ffffff",
        layers: [],
    };

    canvases.push(canvas);
    return { canvas };
}

function addLayer(canvasId, payload) {
    const canvas = canvases.find((item) => item.id === Number(canvasId));
    if (!canvas) return { notFound: true };

    const errors = validateLayer(payload);
    if (errors.length > 0) return { errors };

    const layer = {
        id: canvas.layers.length + 1,
        name: payload.name.trim(),
        opacity: payload.opacity,
        blendMode: payload.blendMode ?? "normal",
    };

    canvas.layers.push(layer);
    return { canvas, layer };
}

export { listCanvases, createCanvas, addLayer };
