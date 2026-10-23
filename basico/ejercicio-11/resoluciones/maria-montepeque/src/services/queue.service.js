function queueTrack(trackName, position) {
    return new Promise((resolve, reject) => {
        if (!trackName || typeof trackName !== "string" || !trackName.trim()) {
            reject(new Error("El nombre de la cancion es obligatorio"));
            return;
        }

        const numericPosition = Number(position);
        if (!Number.isInteger(numericPosition) || numericPosition <= 0) {
            reject(new Error("La posicion en la cola debe ser un numero entero mayor a 0"));
            return;
        }

        setTimeout(() => {
            resolve({ track: trackName.trim(), position: numericPosition });
        }, 300);
    });
}

function estimateWait(queued) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const waitSeconds = queued.position * 45;
            resolve({ ...queued, waitSeconds });
        }, 300);
    });
}

export { queueTrack, estimateWait };