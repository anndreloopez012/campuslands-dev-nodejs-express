function playMatch(playerName, skillLevel, onSuccess, onError) {
    if (!playerName || typeof playerName !== "string" || !playerName.trim()) {
        onError(new Error("El nombre del jugador es obligatorio"));
        return;
    }

    const numericSkill = Number(skillLevel);
    if (!Number.isFinite(numericSkill) || numericSkill <= 0) {
        onError(new Error("El nivel de habilidad debe ser un numero mayor a 0"));
        return;
    }

    setTimeout(() => {
        const rallyLength = Math.round(numericSkill * 2.5);
        const result = rallyLength >= 20 ? "Punto ganado" : "Punto perdido";

        onSuccess({
            player: playerName.trim(),
            skillLevel: numericSkill,
            rallyLength,
            result,
        });
    }, 300);
}

export { playMatch };