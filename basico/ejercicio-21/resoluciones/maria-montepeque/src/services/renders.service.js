import { findRig } from "./rigs.service.js";

const RESOLUTIONS = { "720p": 1, "1080p": 2.2, "4k": 8.5 };
const SECONDS_PER_FRAME = 1.5;

const renders = [];
let nextId = 1;

function validateRender({ rigId, frames, resolution }) {
    const errors = [];

    if (!findRig(rigId)) errors.push("rigId no corresponde a un rig existente");
    if (!Number.isInteger(frames) || frames < 1 || frames > 10000) errors.push("frames debe ser un entero entre 1 y 10000");
    if (!(resolution in RESOLUTIONS)) errors.push(`resolution debe ser una de: ${Object.keys(RESOLUTIONS).join(", ")}`);

    return errors;
}

function listRenders() {
    return renders;
}

function findRender(id) {
    return renders.find((render) => render.id === Number(id)) ?? null;
}

function createRender(payload) {
    const errors = validateRender(payload);
    if (errors.length > 0) return { errors };

    const rig = findRig(payload.rigId);
    const minutes = (payload.frames * SECONDS_PER_FRAME * RESOLUTIONS[payload.resolution]) / 60;

    const render = {
        id: nextId++,
        rig: rig.name,
        frames: payload.frames,
        resolution: payload.resolution,
        estimatedMinutes: Math.ceil(minutes),
        status: "queued",
        createdAt: new Date().toISOString(),
    };

    renders.push(render);
    return { render };
}

export { listRenders, findRender, createRender };
