import { readFileSync, writeFileSync } from "node:fs";

const DATA_PATH = new URL("../data/fighters.json", import.meta.url);

function listFighters() {
    const raw = readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
}

function recordResult(fighterName, result) {
    if (!fighterName || typeof fighterName !== "string" || !fighterName.trim()) {
        throw new Error("El nombre del peleador es obligatorio");
    }
    if (result !== "win" && result !== "loss") {
        throw new Error('El resultado debe ser "win" o "loss"');
    }

    const fighters = listFighters();
    const fighter = fighters.find(
        (f) => f.name.toLowerCase() === fighterName.trim().toLowerCase()
    );
    if (!fighter) {
        throw new Error(`Peleador "${fighterName}" no encontrado`);
    }

    if (result === "win") fighter.wins++;
    else fighter.losses++;

    writeFileSync(DATA_PATH, JSON.stringify(fighters, null, 2));

    return fighter;
}

export { listFighters, recordResult };