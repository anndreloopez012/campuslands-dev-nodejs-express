function getRuntimeInfo() {
    return { nodeVersion: process.version, platform: process.platform, pid: process.pid };
}

function logExpedition(distanceArg) {
    const distance = Number(distanceArg);
    if (!Number.isFinite(distance) || distance <= 0) {
        throw new Error("La distancia debe ser un numero mayor a 0");
    }

    const start = process.hrtime.bigint();
    let steps = 0;
    while (steps < distance * 1000) steps++;
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    let status = "sin explorar";
    if (distance >= 50) status = "zona de alto riesgo";
    else if (distance >= 10) status = "zona muerta";
    else status = "area segura";

    return { distance, status, elapsedMs: Number(elapsedMs.toFixed(4)) };
}

export { getRuntimeInfo, logExpedition };