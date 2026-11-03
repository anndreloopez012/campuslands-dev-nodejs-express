import { rigs } from "../data/rigs.js";

function listRigs({ type } = {}) {
    return type ? rigs.filter((rig) => rig.type === type) : rigs;
}

function findRig(id) {
    return rigs.find((rig) => rig.id === Number(id)) ?? null;
}

export { listRigs, findRig };
